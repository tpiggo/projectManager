# Imports
import MySQLdb, bcrypt, sys
db_connection = {
    'host': 'localhost',
    'user': 'root',
    'password': '', #No pass on my root (fix for your machine)
    'port': 3306,
    'db': 'projectdb'
}
# Connection
m_conn = MySQLdb.connect(
    host=db_connection['host'],
    user=db_connection['user'],
    passwd=db_connection['password'],
    db=db_connection['db'],
    port=db_connection['port']
)

class Logger:
    def __init__(self, path: str):
        """
        Should connect to a file and log the information into it, thus we can keep track of who is accessing this file.
        """
        print('Created a logger: This does nothing now, but we can connect a file and Log :)')
    def warn(self, string: str, format=None):
        """
        Creates a warning in the logging file:
        """
        if (format == None):
            print(string)
        else:
            print(string % format)
    def info(self, string: str, format=None):
        """
        Creates a warning in the logging file:
        """
        if (format == None):
            print(string)
        else:
            print(string % format)


logger = Logger('./db_interaction_logger.txt')

def pushToTest():
    hashed = bcrypt.hashpw('123admin'.encode(), bcrypt.gensalt())
    encoded = ''
    for i in hashed:
        encoded += chr(i)
    sql = """
        INSERT INTO testtable(descrp)
        VALUES
        ('%s');
    """ % encoded
    cursor = m_conn.cursor()
    cursor.execute(sql)
    # commiting change
    m_conn.commit()
    print(sql)
def return_to_encoded():
    try: 
        cursor = m_conn.cursor()
        sql = """
            SELECT descrp FROM testtable WHERE tid=8
        """
        cursor.execute(sql)
        entries = cursor.fetchall()
        if len(entries) < 0:
            raise Exception("Nothing found!")
        elif len(entries) > 2:
            raise Exception("Too many elements found! Retry your query!!!")
        # Return to byte string
        print(entries[0][0])
        byte_string = entries[0][0].encode()
        print(byte_string)
        res = bcrypt.checkpw(b'123admin', byte_string)
        print(res)
    except Exception as exc:
        print("Unexpected error:", exc)

def create_user():
    print('Creating Users from the command line.')
    cursor = m_conn.cursor()
    user = input('Enter your credentials:')
    try:
        username = input('username: ')
        password = input('password: ')
        email = input('email: ')
        level = input('user level (0 to 2): ')
    except MySQLdb.IntegrityError:
        print('Error!')

def create_admin():
    print("CREATING ADMIN USER")
    cursor = m_conn.cursor()
    try:
        sql = """
            SELECT * FROM users WHERE username='admin'
        """
        cursor.execute(sql)
        entries = cursor.fetchall()
        if ( len(entries) > 0):
            raise Exception('Admin exists!')
        pwd = input('password: ')
        while len(pwd) < 8:
            print('Must be longer than 8 characters!')
            pwd = input('Enter password')
        hashed = bcrypt.hashpw(pwd.encode(), bcrypt.gensalt())
        encoded = hashed.decode('utf-8')
        sql =  """
            INSERT INTO users (username, upass, email, ulevel)
            VALUES
            ("admin", "%s", "None", 3)
        """ % encoded
        print()
        cursor.execute(sql)
        m_conn.commit()
        logger.info('Successfully created admin!')
    except MySQLdb.IntegrityError as integrity:
        logger.warn('Integrity error: %s. Failed to create admin', integrity)
    except MySQLdb.InterfaceError as interface:
        logger.warn('Interface error: %s. Failed to create admin', interface)
    except MySQLdb.InternalError as internal:
        logger.warn('Internal error: %s. Failed to create admin', internal)
    except MySQLdb._exceptions.ProgrammingError as pe:
        logger.warn('Programming error: %s. Failed to create admin', pe)
    except Exception as exc:
        logger.warn("Unexpected error: %s", exc)
    finally:
        cursor.close()


def update_super_user():
    print('Danger!')
    print('Updating Super Users from the command line.')

if __name__ == "__main__":
    create_admin()

    # Close the connection
    m_conn.close()
    print('DONE')