/**
Creating all the Tables within the database
*/
create table ProjectDB.priority (
	priorityid int auto_increment,
	name varchar(255) unique not null,
	primary key (priorityid)
)
ENGINE=InnoDB
DEFAULT CHARSET=utf8mb4
COLLATE=utf8mb4_general_ci;

-- Create next
create table ProjectDB.direction(
	directionid int auto_increment,
	name varchar(255) unique not null,
	priorityid int,
	primary key(directionid),
	constraint fk_directionpriority foreign key (priorityid) references ProjectDB.priority(priorityid)
)
ENGINE=InnoDB
DEFAULT CHARSET=utf8mb4
COLLATE=utf8mb4_general_ci;

-- Create next
create table ProjectDB.objective(
	objectiveid int auto_increment,
	name varchar(255) not null,
	directionid int,
	primary key(objectiveid),
	constraint fk_objectivedirection foreign key (directionid) references ProjectDB.direction(directionid)
)
ENGINE=InnoDB
DEFAULT CHARSET=utf8mb4
COLLATE=utf8mb4_general_ci;

-- Create next
CREATE TABLE ProjectDB.department (
	departmentid int not null AUTO_INCREMENT,
	name varchar(255) unique NOT NULL,
	PRIMARY KEY(departmentid)
)
ENGINE=InnoDB
DEFAULT CHARSET=utf8mb4
COLLATE=utf8mb4_general_ci;

-- Create next
CREATE TABLE ProjectDB.company (
	companyid int not null AUTO_INCREMENT,
	name varchar(255) unique NOT NULL,
	PRIMARY KEY(companyid)
)
ENGINE=InnoDB
DEFAULT CHARSET=utf8mb4
COLLATE=utf8mb4_general_ci;

-- Create next
CREATE TABLE ProjectDB.projecttype (
	typeid int not null AUTO_INCREMENT,
	name varchar(255) unique NOT NULL,
	PRIMARY KEY(typeid)
)
ENGINE=InnoDB
DEFAULT CHARSET=utf8mb4
COLLATE=utf8mb4_general_ci;

-- creating project table
CREATE TABLE ProjectDB.project(
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
	constraint fk_projowner foreign key (owner) references ProjectDB.department(departmentid),
	constraint fk_projobjective foreign key (objectiveid) references ProjectDB.objective(objectiveid),
	constraint fk_projtype foreign key (projecttype) references ProjectDB.projecttype(typeid)
)
ENGINE=InnoDB
DEFAULT CHARSET=utf8mb4
COLLATE=utf8mb4_general_ci;
-- Creating the supporters and stakeholders
CREATE TABLE ProjectDB.supporter (
	departmentid int,
	projectid int, 
	primary key(departmentid, projectid),
	constraint fk_supportdept foreign key (departmentid) references ProjectDB.department(departmentid),
	constraint fk_supportproject foreign key (projectid) references ProjectDB.project(projectid)
)
ENGINE=InnoDB
DEFAULT CHARSET=utf8mb4
COLLATE=utf8mb4_general_ci;
-- Haven't executed yet
CREATE TABLE ProjectDB.stakeholder (
	departmentid int,
	companyid int,
	projectid int, 
	primary key(departmentid, companyid, projectid),
	constraint fk_stakeholderdept 
	foreign key (departmentid)
	references ProjectDB.department(departmentid),
	constraint fk_stakeholdercompany
	foreign key (companyid)
	references ProjectDB.company(companyid),
	constraint fk_stakeholderproject
	foreign key (projectid)
	references ProjectDB.project(projectid)
)
ENGINE=InnoDB
DEFAULT CHARSET=utf8mb4
COLLATE=utf8mb4_general_ci;

CREATE TABLE ProjectDB.milestone (
	projectid int,
	description varchar(1000) not null,
	deadline date not null,
	constraint fk_milestoneproject foreign key (projectid) references ProjectDB.project(projectid)
)
ENGINE=InnoDB
DEFAULT CHARSET=utf8mb4
COLLATE=utf8mb4_general_ci;

show tables;