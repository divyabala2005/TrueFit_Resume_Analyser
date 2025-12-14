import sqlite3
import datetime
from pathlib import Path

# Use a local SQLite file in the app directory or user workspace
DB_PATH = Path("chat_history.db")

def get_db_connection():
    conn = sqlite3.connect(str(DB_PATH))
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    conn = get_db_connection()
    cursor = conn.cursor()
    # Chat table
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS chats (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            role TEXT NOT NULL,
            message TEXT NOT NULL,
            timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    """)
    # Activity table
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS activities (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            type TEXT NOT NULL,
            tag TEXT,
            title TEXT NOT NULL,
            detail TEXT,
            route TEXT,
            timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    """)
    conn.commit()
    conn.close()

# Initialize on import (safe for this scale)
init_db()

def save_message(role: str, message: str):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("INSERT INTO chats (role, message) VALUES (?, ?)", (role, message))
    conn.commit()
    conn.close()

def get_history():
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT role, message, timestamp FROM chats ORDER BY id ASC")
    rows = cursor.fetchall()
    conn.close()
    return [dict(row) for row in rows]

def clear_history():
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("DELETE FROM chats")
    conn.commit()
    conn.close()

def log_activity(type: str, tag: str, title: str, detail: str, route: str):
    conn = get_db_connection()
    cursor = conn.cursor()
    # Use UTC ISO format for better compatibility with frontend Date parsing
    timestamp = datetime.datetime.utcnow().isoformat() + "Z"
    
    cursor.execute(
        "INSERT INTO activities (type, tag, title, detail, route, timestamp) VALUES (?, ?, ?, ?, ?, ?)",
        (type, tag, title, detail, route, timestamp)
    )
    conn.commit()
    conn.close()

def get_recent_activities(limit: int = 10):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM activities ORDER BY id DESC LIMIT ?", (limit,))
    rows = cursor.fetchall()
    conn.close()
    return [dict(row) for row in rows]
