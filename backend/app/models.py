from datetime import datetime
from sqlalchemy import (Column, Integer, String, Float, Text, Date, DateTime,
                        ForeignKey, UniqueConstraint)
from sqlalchemy.orm import relationship
from .database import Base


class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True)
    name = Column(String(100), nullable=False)
    email = Column(String(150), unique=True, index=True, nullable=False)
    password_hash = Column(String(300), nullable=False)
    role = Column(String(20), nullable=False, default="STUDENT")  # STUDENT / ADMIN
    profile = relationship("StudentProfile", back_populates="user",
                           uselist=False, cascade="all, delete-orphan")


class StudentProfile(Base):
    __tablename__ = "student_profiles"
    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey("users.id"), unique=True, nullable=False)
    branch = Column(String(100))
    semester = Column(Integer)
    cgpa = Column(Float)
    backlogs = Column(Integer, default=0)
    skills = Column(Text, default="")          # comma separated
    phone = Column(String(20))
    resume_reference = Column(String(300))     # MinIO object key
    user = relationship("User", back_populates="profile")
    applications = relationship("Application", back_populates="student",
                                cascade="all, delete-orphan")


class Company(Base):
    __tablename__ = "companies"
    id = Column(Integer, primary_key=True)
    name = Column(String(150), nullable=False)
    description = Column(Text, default="")
    website = Column(String(200), default="")
    industry = Column(String(100), default="")
    jobs = relationship("Job", back_populates="company", cascade="all, delete-orphan")


class Job(Base):
    __tablename__ = "jobs"
    id = Column(Integer, primary_key=True)
    company_id = Column(Integer, ForeignKey("companies.id"), nullable=False)
    title = Column(String(150), nullable=False)
    description = Column(Text, default="")
    minimum_cgpa = Column(Float, default=0)
    maximum_backlogs = Column(Integer, default=0)
    eligible_branches = Column(Text, default="")   # comma separated, empty = all
    required_skills = Column(Text, default="")     # comma separated
    deadline = Column(Date, nullable=True)
    status = Column(String(20), default="OPEN")    # OPEN / CLOSED
    company = relationship("Company", back_populates="jobs")
    applications = relationship("Application", back_populates="job",
                                cascade="all, delete-orphan")


class Application(Base):
    __tablename__ = "applications"
    __table_args__ = (UniqueConstraint("student_id", "job_id", name="uq_student_job"),)
    id = Column(Integer, primary_key=True)
    student_id = Column(Integer, ForeignKey("student_profiles.id"), nullable=False)
    job_id = Column(Integer, ForeignKey("jobs.id"), nullable=False)
    application_date = Column(DateTime, default=datetime.utcnow)
    status = Column(String(20), default="APPLIED")
    student = relationship("StudentProfile", back_populates="applications")
    job = relationship("Job", back_populates="applications")