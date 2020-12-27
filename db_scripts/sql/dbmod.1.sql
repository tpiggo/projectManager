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
	constraint fk_milestoneproject foreign key (projectid) references projectdb.project(projectid)
)
ENGINE=InnoDB
DEFAULT CHARSET=utf8mb4
COLLATE=utf8mb4_general_ci;

INSERT INTO projectdb.department (name)
VALUES ('Hotel'), ('Even'), ('Bill'),
('Mention'), ('Listen'),
('Story'), ('He'), ('Begin'),
('Democratic'), ('Heart'), ('Nature'),
('Budget'), ('Case'), ('Memory'),
('Window'), ('Seat');

INSERT INTO projectdb.company (name) VALUES ('Foot Able'), ('Specific Establish Account'), ('Make'),
('Concern Once'), ('Kind'), ('Similar'),
('Dream'), ('Low'), ('Participant Music Above'),
('Politics Bad'), ('Choose Baby Federal'), ('Number On'),
('Generation Apply Subject'), ('Weight'), ('Second Bed Police'),
('Thus'), ('Eat'), 
('Large Officer'), ('Pattern Commercial'), ('Reach');

insert into projectdb.priority (Name) values ('Sectoral'), ('Institutional');
insert into projectdb.direction (name, priorityid) 
values ('Talent and Education', 1),
('Accessibility and Engagement', 1),
('Creative Economy', 1),
('Global Footprint', 1),
('Cultural Responsibility', 1),
('Digital Transformation', 2),
('Operational Excellence', 2),
('Happiness', 2);

select * from projectdb.priority;
select * from projectdb.direction;

insert into projectdb.objective (description, directionid)
values ('Foster an ecosystem for young talent to thrive (in and outside the education system)', 1),
('Attract & retain diverse global talent', 1),
('Integrate arts & creativity in the city’s urban spaces', 2),
('Strengthen and increase engagement of the diverse community', 2),
('Cultivate a nurturing business environment',3),
('Boost Dubai’s status as a cultural destination', 4),
('Export Dubai’s homegrown cultural offerings', 4),
('Safeguard intangible and tangible cultural heritage', 5),
('Data and Information', 6),
('Automation', 6),
('Technology', 6),
('Revenue Generation and Growth', 7),
('Optimizated Spending and Operational Excellence', 7),
('Organizational Agility', 7),
('Employee Happiness', 8),
('Customer Happiness', 8);

select * from projectdb.objective;

-- Creating entries for strategic kpis
insert into projectdb.strategickpi ( kpi, objectiveid ) 
values ('% of instructional hours dedicated to culture & arts in relation to the total number of instructional hours (ECE, primary and secondary)', 1),
('Enrolment rate of students in culture and arts specializations', 1),
('Number of students enrolled in culture and arts educational courses outside the educational curriculum', 1),
('% of talent that have obtained the cultural visa in related to the total number of talent targeted to be granted the cultural visa', 2),
('GDP contribution of talent holding the cultural visa to the economy of Dubai', 2),
('Number of international talent attracted to Dubai through culture and arts programs and platforms',2),
('Distribution of selected cultural infrastructures relative to the distribution of the country’s population (Libraries, Museums, Art Centers, Exhibition Centers)', 3),
('Cultural Engagement Index', 4),
('Ease of accessibility to cultural facilities and engagement of people of determination in cultural activities that are under the umbrella or sponsored by DC', 4),
('Number of cultural, arts and heritage orgs. (Profit, NPOs)', 5),
('CCI GDP Contribution to Dubai economy', 5),
('Number of CCI jobs (full-time, temporary and freelancers) in the CCI sector in Dubai ', 5),
('Employment rate within CCI', 5),
('Number of SMEs in CCI', 5),
('Average growth rate of international cultural tourism contribution to Dubai (in collaboration with DTCM)', 6),
('Dubai’s ranking in the cultural engagement index in GPCI (Global Power City Index)', 6),
('Number of creatives participating in international events', 7),
('Cultural exports revenues', 7),
('Number of museums complying to approved standards', 8);

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
