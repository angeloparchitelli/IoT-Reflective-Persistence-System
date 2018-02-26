# IoT-Reflective-Persistence-System
This project allows to storage data using a Reflective Software Pattern.

The real time feed, coming from a Arduino board passing through middleware and flow into DeviceHive Cloud. 
The project was implemented as a prototype using:
* Arduino: for sensors interaction 
* RaspberryPi: for data transmission 
* Linux server: for management, sorting and sending data to the cloud.

## Repository
* In *Arduino_read_sensor_hum_temp* there is a code for Arduino that allows to read a temperature and humidity from DHT22 sensors
* In *serial_data_reader* there is a Python code that download the data from board and send it to middleware
* In *reflective_middleware* there is the Core of the Project: a NodeJS Reflective Middleware.

# Contacts 
Angelo Parchitelli a [dot] parchitelli 89 [at] gmail [dot] com

Gianfranco Micoli
