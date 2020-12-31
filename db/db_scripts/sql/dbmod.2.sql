
-- Inserting proper values into these databases 

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