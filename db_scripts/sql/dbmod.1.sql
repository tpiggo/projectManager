-- drop database projectdb;
create database projectdb;
/* Creating all the Tables within the database */
create table projectdb.priority (
	priorityid int auto_increment,
	name varchar(255) unique not null,
	primary key (priorityid)
)
ENGINE=InnoDB
DEFAULT CHARSET=utf8mb4
COLLATE=utf8mb4_general_ci;

-- Create next
create table projectdb.direction(
	directionid int auto_increment,
	name varchar(255) unique not null,
	priorityid int,
	primary key(directionid, priorityid),
	constraint fk_directionpriority foreign key (priorityid) references projectdb.priority(priorityid)
)
ENGINE=InnoDB
DEFAULT CHARSET=utf8mb4
COLLATE=utf8mb4_general_ci;

-- Create next
create table projectdb.objective(
	objectiveid int auto_increment,
	description varchar(1000) not null,
	directionid int,
	primary key(objectiveid, directionid),
	constraint fk_objectivedirection foreign key (directionid) references projectdb.direction(directionid)
)
ENGINE=InnoDB
DEFAULT CHARSET=utf8mb4
COLLATE=utf8mb4_general_ci;
-- Create the strategic KPIs
create table projectdb.strategickpi(
	kpiid int auto_increment,
	kpi varchar(2000) not null unique,
	objectiveid int,
	primary key(kpiid, objectiveid),
	constraint fk_kpiobjective foreign key (objectiveid) references projectdb.objective(objectiveid)
)
ENGINE=InnoDB
default CHARSET=utf8mb4
collate=utf8mb4_general_ci;

-- Create next
CREATE TABLE projectdb.department (
	departmentid int not null AUTO_INCREMENT,
	name varchar(255) unique NOT NULL,
	PRIMARY KEY(departmentid)
)
ENGINE=InnoDB
DEFAULT CHARSET=utf8mb4
COLLATE=utf8mb4_general_ci;

-- Create next
CREATE TABLE projectdb.company (
	companyid int not null AUTO_INCREMENT,
	name varchar(255) unique NOT NULL,
	PRIMARY KEY(companyid)
)
ENGINE=InnoDB
DEFAULT CHARSET=utf8mb4
COLLATE=utf8mb4_general_ci;

-- Create next
CREATE TABLE projectdb.projecttype (
	typeid int not null AUTO_INCREMENT,
	name varchar(255) unique NOT NULL,
	PRIMARY KEY(typeid)
)
ENGINE=InnoDB
DEFAULT CHARSET=utf8mb4
COLLATE=utf8mb4_general_ci;

-- creating project table
CREATE TABLE projectdb.project(
	projectid int auto_increment,
	name varchar(255) unique not null,
	owner int,
	objectiveid int,
	description varchar(2000) not null,
	budget int not null,
	projecttype int,
	projectscope varchar(250) not null,
	vision varchar(250) not null,
	weight int default 0,
	survery bool default false,
	primary key(projectid),
	constraint fk_projowner foreign key (owner) references projectdb.department(departmentid),
	constraint fk_projobjective foreign key (objectiveid) references projectdb.objective(objectiveid),
	constraint fk_projtype foreign key (projecttype) references projectdb.projecttype(typeid)
)
ENGINE=InnoDB
DEFAULT CHARSET=utf8mb4
COLLATE=utf8mb4_general_ci;
-- Creating the supporters and stakeholders
CREATE TABLE projectdb.supporter (
	departmentid int,
	projectid int,
	supportrole varchar(2000),
	primary key(departmentid, projectid),
	constraint fk_supportdept foreign key (departmentid) references projectdb.department(departmentid),
	constraint fk_supportproject foreign key (projectid) references projectdb.project(projectid)
)
ENGINE=InnoDB
DEFAULT CHARSET=utf8mb4
COLLATE=utf8mb4_general_ci;
-- Haven't executed yet
CREATE TABLE projectdb.stakeholder (
	departmentid int,
	companyid int,
	projectid int, 
	primary key(departmentid, companyid, projectid),
	constraint fk_stakeholderdept 
	foreign key (departmentid)
	references projectdb.department(departmentid),
	constraint fk_stakeholdercompany
	foreign key (companyid)
	references projectdb.company(companyid),
	constraint fk_stakeholderproject
	foreign key (projectid)
	references projectdb.project(projectid)
)
ENGINE=InnoDB
DEFAULT CHARSET=utf8mb4
COLLATE=utf8mb4_general_ci;

CREATE TABLE projectdb.milestone (
	projectid int,
	description varchar(1000) not null,
	deadline date not null,
	startdate date not null,
	constraint fk_milestoneproject foreign key (projectid) references projectdb.project(projectid),
	constraint startbefore check (startdate < deadline)
)
ENGINE=InnoDB
DEFAULT CHARSET=utf8mb4
COLLATE=utf8mb4_general_ci;

create table projectdb.projectkpi(
	kpiid int auto_increment,
	projectid int,
	kpi varchar(2000) not null,
	primary key(kpiid, projectid),
	constraint fk_projectkpi foreign key (projectid) references projectdb.project(projectid)
)
ENGINE=InnoDB
DEFAULT CHARSET=utf8mb4
COLLATE=utf8mb4_general_ci;

create table projectdb.projectstrategickpi(
	projectid int,
	strategickpiid int,
	constraint fk_projectid foreign key (projectid) references projectdb.project(projectid),
	constraint pk_strategickpiid foreign key (strategickpiid) references projectdb.strategickpi(kpiid),
	primary key(projectid, strategickpiid)
)
ENGINE=InnoDB
DEFAULT CHARSET=utf8mb4
COLLATE=utf8mb4_general_ci;

create table projectdb.budgetbreakdown(
	bdid int auto_increment,
	projectid int not null,
	bdamount int not null,
	bddescr varchar(2000),
	primary key(bdid, projectid),
	constraint fk_projectbd foreign key (projectid) references projectdb.project(projectid)
)
ENGINE=InnoDB
DEFAULT CHARSET=utf8mb4
COLLATE=utf8mb4_general_ci;

-- users table
create table projectdb.users(
	userid int auto_increment,
	username varchar(100) unique not null,
	upass varchar(255) not null,
	email varchar(255) not null,
	ulevel int not null default 0,
	primary key(userid)
)
ENGINE=InnoDB
DEFAULT CHARSET=utf8mb4
COLLATE=utf8mb4_general_ci;