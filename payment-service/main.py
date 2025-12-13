from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime
from sqlalchemy import create_engine, Column, Integer, String, Float, DateTime
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, Session
import os
import random

DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://postgres:postgres@postgres:5432/paymentdb")
engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

class Payment(Base):
    __tablename__ = "payments"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(String, nullable=False)
    booking_type = Column(String, nullable=False)
    booking_id = Column(String, nullable=False)
    amount = Column(Float, nullable=False)
    payment_method = Column(String, nullable=False)
    status = Column(String, default="pending")
    transaction_id = Column(String, unique=True, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

Base.metadata.create_all(bind=engine)

class PaymentCreate(BaseModel):
    user_id: str
    booking_type: str
    booking_id: str
    amount: float
    payment_method: str

class PaymentResponse(BaseModel):
    id: int
    user_id: str
    booking_type: str
    booking_id: str
    amount: float
    payment_method: str
    status: str
    transaction_id: str
    created_at: datetime
    
    class Config:
        from_attributes = True

app = FastAPI(title="Payment Service")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@app.api_route("/health", methods=["GET", "HEAD"])
def health_check(request: Request):
    return {"status": "ok", "service": "payment-service"}

@app.post("/api/payments", response_model=dict)
def create_payment(payment: PaymentCreate):
    db = SessionLocal()
    try:
        transaction_id = f"TXN-{random.randint(100000, 999999)}-{datetime.utcnow().timestamp()}"

        # Always complete payment (removed 10% random failure for demo purposes)
        status = "completed"
        
        db_payment = Payment(
            user_id=payment.user_id,
            booking_type=payment.booking_type,
            booking_id=payment.booking_id,
            amount=payment.amount,
            payment_method=payment.payment_method,
            status=status,
            transaction_id=transaction_id
        )
        
        db.add(db_payment)
        db.commit()
        db.refresh(db_payment)
        
        return {
            "success": True,
            "data": {
                "id": db_payment.id,
                "user_id": db_payment.user_id,
                "booking_type": db_payment.booking_type,
                "booking_id": db_payment.booking_id,
                "amount": db_payment.amount,
                "payment_method": db_payment.payment_method,
                "status": db_payment.status,
                "transaction_id": db_payment.transaction_id,
                "created_at": db_payment.created_at.isoformat()
            }
        }
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=400, detail=str(e))
    finally:
        db.close()

@app.get("/api/payments/user/{user_id}")
def get_user_payments(user_id: str):
    db = SessionLocal()
    try:
        payments = db.query(Payment).filter(Payment.user_id == user_id).all()
        return {
            "success": True,
            "data": [
                {
                    "id": p.id,
                    "user_id": p.user_id,
                    "booking_type": p.booking_type,
                    "booking_id": p.booking_id,
                    "amount": p.amount,
                    "payment_method": p.payment_method,
                    "status": p.status,
                    "transaction_id": p.transaction_id,
                    "created_at": p.created_at.isoformat()
                }
                for p in payments
            ]
        }
    finally:
        db.close()

@app.get("/api/payments/{payment_id}")
def get_payment(payment_id: int):
    db = SessionLocal()
    try:
        payment = db.query(Payment).filter(Payment.id == payment_id).first()
        if not payment:
            raise HTTPException(status_code=404, detail="Payment not found")
        
        return {
            "success": True,
            "data": {
                "id": payment.id,
                "user_id": payment.user_id,
                "booking_type": payment.booking_type,
                "booking_id": payment.booking_id,
                "amount": payment.amount,
                "payment_method": payment.payment_method,
                "status": payment.status,
                "transaction_id": payment.transaction_id,
                "created_at": payment.created_at.isoformat()
            }
        }
    finally:
        db.close()

@app.get("/api/payments/transaction/{transaction_id}")
def get_payment_by_transaction(transaction_id: str):
    db = SessionLocal()
    try:
        payment = db.query(Payment).filter(Payment.transaction_id == transaction_id).first()
        if not payment:
            raise HTTPException(status_code=404, detail="Payment not found")
        
        return {
            "success": True,
            "data": {
                "id": payment.id,
                "user_id": payment.user_id,
                "booking_type": payment.booking_type,
                "booking_id": payment.booking_id,
                "amount": payment.amount,
                "payment_method": payment.payment_method,
                "status": payment.status,
                "transaction_id": payment.transaction_id,
                "created_at": payment.created_at.isoformat()
            }
        }
    finally:
        db.close()

@app.patch("/api/payments/{payment_id}/refund")
def refund_payment(payment_id: int):
    db = SessionLocal()
    try:
        payment = db.query(Payment).filter(Payment.id == payment_id).first()
        if not payment:
            raise HTTPException(status_code=404, detail="Payment not found")
        
        if payment.status != "completed":
            raise HTTPException(status_code=400, detail="Only completed payments can be refunded")
        
        payment.status = "refunded"
        db.commit()
        db.refresh(payment)
        
        return {
            "success": True,
            "data": {
                "id": payment.id,
                "status": payment.status,
                "message": "Payment refunded successfully"
            }
        }
    finally:
        db.close()

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=3003)