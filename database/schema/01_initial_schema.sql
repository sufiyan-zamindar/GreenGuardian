-- GreenGuardian Database Schema
-- Plant Disease Detection & Treatment Database

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users Table
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(100) UNIQUE NOT NULL,
    email VARCHAR(120) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(150),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Diseases Table
CREATE TABLE IF NOT EXISTS diseases (
    id SERIAL PRIMARY KEY,
    disease_name VARCHAR(150) UNIQUE NOT NULL,
    scientific_name VARCHAR(200),
    category VARCHAR(50),
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Disease Profiles Table (Treatment Information)
CREATE TABLE IF NOT EXISTS disease_profiles (
    id SERIAL PRIMARY KEY,
    disease_id INTEGER NOT NULL,
    symptoms TEXT,
    organic_remedies TEXT,
    chemical_treatments TEXT,
    preventive_measures TEXT,
    severity_level VARCHAR(20),
    spread_rate VARCHAR(50),
    humidity_requirement VARCHAR(50),
    season_affected VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (disease_id) REFERENCES diseases(id) ON DELETE CASCADE
);

-- Diagnoses Table (Prediction History)
CREATE TABLE IF NOT EXISTS diagnoses (
    id SERIAL PRIMARY KEY,
    user_id INTEGER,
    disease_id INTEGER NOT NULL,
    confidence_score FLOAT NOT NULL CHECK (confidence_score >= 0 AND confidence_score <= 1),
    image_path VARCHAR(255),
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
    FOREIGN KEY (disease_id) REFERENCES diseases(id) ON DELETE RESTRICT
);

-- Treatments Table (Treatment History)
CREATE TABLE IF NOT EXISTS treatments (
    id SERIAL PRIMARY KEY,
    diagnosis_id INTEGER NOT NULL,
    treatment_type VARCHAR(50),
    treatment_description TEXT,
    applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    effectiveness FLOAT,
    notes TEXT,
    FOREIGN KEY (diagnosis_id) REFERENCES diagnoses(id) ON DELETE CASCADE
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_diseases_name ON diseases(disease_name);
CREATE INDEX IF NOT EXISTS idx_disease_profiles_disease_id ON disease_profiles(disease_id);
CREATE INDEX IF NOT EXISTS idx_diagnoses_user_id ON diagnoses(user_id);
CREATE INDEX IF NOT EXISTS idx_diagnoses_disease_id ON diagnoses(disease_id);
CREATE INDEX IF NOT EXISTS idx_diagnoses_created_at ON diagnoses(created_at);
CREATE INDEX IF NOT EXISTS idx_treatments_diagnosis_id ON treatments(diagnosis_id);
