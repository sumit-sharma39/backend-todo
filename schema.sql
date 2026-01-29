create table if not exist task(
    Id serial primary key ,
    title text default task,
    description text default "",
    bullets text[] default '{}',
    completed boolean default False,
    deadline date(), 
    image_url text[] default '{}', 
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
)

CREATE TABLE users (
    id SERIAL PRIMARY KEY,    
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
