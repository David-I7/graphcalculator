-- create database prod;

-- \connect prod;

-- CONFIG

alter database prod set timezone to 'UTC';
create extension if not exists pgcrypto;

-- TABLES

-- ENUMS

create table if not exists roles(
	id smallint Primary key,
	name varchar(20) not null
);

INSERT INTO roles (id, name) VALUES
(2093, 'USER'),
(1443, 'ADMIN') on conflict (id) do nothing;

create table if not exists providers(
	id smallint Primary key,
	name varchar(20) not null
);

INSERT INTO providers (id, name) VALUES
(0, 'graphCalculator'),
(1, 'google') on conflict (id) do nothing;

-- RELATIONS

create table if not exists users(
    id uuid Primary Key default gen_random_uuid(),
    first_name text not null,
    last_name text,
    email text not null unique,
    email_is_verified boolean not null default FALSE,
    password bytea default null,
    provider smallint not null default 0 references providers(id) on update cascade,
    role smallint not null default 2093 references roles(id) on update cascade
);


create table if not exists saved_graphs(
    id uuid not null,
    user_id uuid not null references users(id) on delete cascade,
    name varchar(50) not null,
    modified_at timestamptz not null,
    graph_snapshot json not null,
    items json not null,
    image varchar(90) not null,
    Primary key (user_id,id)
);  

create table if not exists deleted_users(
    schedule_date timestamptz not null,
    user_id uuid not null references users(id) on delete cascade unique
)