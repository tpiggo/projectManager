# Functions for filling the database with garbage.
# DELETE CONTENTS OF DB BEFORE EXPORTING!
# 

# Imports
from faker import Faker
import MySQLdb
import random
# create faker
m_fake = Faker()
# Connection information to localhosted DB
# MUST BE RUNNING (Don't forget to start your db server)
db_connection = {
    'host': 'localhost',
    'user': 'root',
    'password': '', #No pass on my root (fix for your machine)
    'port': 3306,
    'db': 'ProjectDB'
}
# Connection
m_conn = MySQLdb.connect(
    host=db_connection['host'],
    user=db_connection['user'],
    passwd=db_connection['password'],
    db=db_connection['db'],
    port=db_connection['port']
)


def createDb():
    print("Starting createDB function")
    tables = ['department', 'company']
    fill_table(tables[0], create_query_string_only(tables[0], 16),tables[0])
    fill_table(tables[1], create_query_string_only(tables[1], 20), tables[1])


def fill_table(table_name, query, field_names):
    sql_query = f'INSERT INTO {table_name} ('
    for i in field_names:
        sql_query += i
    sql_query += f') VALUES ' + query
    print(sql_query)

def get_table_fields(table_name):
    cursor = m_conn.cursor()
    cursor.execute(f'SELECT * FROM {table_name} LIMIT 0')
    field_names = [ i[0] for i in cursor.description ]
    cursor.execute(f'SHOW KEYS FROM {table_name} WHERE Key_name = \'PRIMARY\'')
    n = 0
    for i in cursor.description:
        if (i[0] == 'Column_name'):
            break
        n += 1 
    primary_keys = [i[n] for i in cursor]
    field_names = [i for i in field_names if i not in primary_keys]
    return field_names

def create_query_string_only(p_type, max_len):
    faker_split = m_fake.sentence().split(' ')
    name = faker_split[0] 
    hasExtra = random.randint(0,2)
    if (hasExtra > 0 and p_type == 'company'):
        name += " " + faker_split[1][:1].upper() + faker_split[1][1:] 
    if (hasExtra > 1 and len(faker_split) > 1 and p_type == 'company'):
        faker_split[2] =  faker_split[2][:1].upper() + faker_split[2][1:]
        faker_split[2] = faker_split[2].replace(".", '')
        name += " " + faker_split[2]
    return name

if __name__=='__main__':
    print("Started!")
    createDb()