from datetime import date, timedelta
from .models import User, StudentProfile, Company, Job
from .security import hash_password


def seed(db):
    if db.query(User).filter(User.email == "tpo@college.edu").first():
        return

    db.add(User(name="TPO Admin", email="tpo@college.edu",
                password_hash=hash_password("admin123"), role="ADMIN"))

    s1 = User(name="Aarav Sharma", email="student1@college.edu",
              password_hash=hash_password("student123"), role="STUDENT")
    s1.profile = StudentProfile(branch="Computer Engineering", semester=7, cgpa=8.2,
                                backlogs=0, skills="Java,Python,SQL", phone="9000000001")
    s2 = User(name="Riya Patel", email="student2@college.edu",
              password_hash=hash_password("student123"), role="STUDENT")
    s2.profile = StudentProfile(branch="Information Technology", semester=7, cgpa=6.5,
                                backlogs=1, skills="HTML,CSS", phone="9000000002")
    db.add_all([s1, s2])

    c1 = Company(name="ABC Technologies", description="Product-based software company",
                 website="https://abc.example.com", industry="Software")
    c2 = Company(name="XYZ Consulting", description="IT services and consulting",
                 website="https://xyz.example.com", industry="Consulting")
    db.add_all([c1, c2])
    db.flush()

    dl = date.today() + timedelta(days=60)
    db.add_all([
        Job(company_id=c1.id, title="Software Engineer",
            description="Backend development with Java and SQL.",
            minimum_cgpa=7.5, maximum_backlogs=0,
            eligible_branches="Computer Engineering,Information Technology",
            required_skills="Java,SQL", deadline=dl, status="OPEN"),
        Job(company_id=c1.id, title="Data Analyst",
            description="Dashboards and reporting.",
            minimum_cgpa=7.0, maximum_backlogs=0,
            eligible_branches="Computer Engineering,Information Technology",
            required_skills="Python,SQL", deadline=dl, status="OPEN"),
        Job(company_id=c2.id, title="Associate Consultant",
            description="Client-facing IT consulting role.",
            minimum_cgpa=6.0, maximum_backlogs=2,
            eligible_branches="", required_skills="", deadline=dl, status="OPEN"),
    ])
    db.commit()