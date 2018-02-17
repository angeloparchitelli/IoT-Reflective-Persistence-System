#!/usr/bin/env python3
import serial
import syslog
import time
import json
import sys, os, errno
import argparse
import dbus
import json
from dbus.mainloop.glib import DBusGMainLoop
from gi.repository import GObject

DBusGMainLoop(set_as_default=True)

def get_cloud():
    obj = dbus.SystemBus().get_object("com.devicehive.cloud", '/com/devicehive/cloud')
    return dbus.Interface(obj, "com.devicehive.cloud")

cloud = get_cloud()


DEFAULT_PRIORITY = 100

port = "";
set_time  = False;
sinc = 1;
timestamp = 0;

def readSerial(ard) :
	size = 0;
	serialIn = "";
	print "Waiting for data..."
	while size == 0:
		#Leggo dal buffer (metodo 1)
		time.sleep(1); #Faccio riempire il buffer
		serialIn = ard.read(ard.inWaiting());

		#Leggo dal buffer (metodo 2)
		#serialIn = ard.readline();
		size = len(serialIn);

	return serialIn;

def sync(ard) :
	global set_time;
	global sinc;
	global timestamp;

	timestamp = int(time.time());
	ard.write("T"+str(timestamp));
	set_time = True;
	sinc = 10;
	print "Synced";

def main() :
	global set_time;
	global sinc;
	global timestamp;

	try :
		ard = serial.Serial(port,9600,timeout=5);
		time.sleep(1);

		while (True):
			sensor_temp = False;
            sensor_hum = False;
			msg = readSerial(ard);
			ts = str(int(time.time()))
			print ts + "> " + msg.rstrip();
			print ts + "> Synced? " + str(set_time);
			try:
				if set_time == True:
					print ts + "> " + str(json.loads(msg)["data"][0]) + " - " + str(json.loads(msg)["data"][1]);
					sensor_temp = json.loads(msg)["data"][0];
					sensor_hum = json.loads(msg)["data"][1];
				else:
					print ts + "> " + str(dict(json.loads(msg)));
					sensor_temp = False;
					sensor_hum = False;
			except Exception, e:
				print ts + "> JSON Error: %s" % e;

			if set_time == False:
				sync(ard);

			try:
				if (sensor_temp != False) and (sensor_hum != False) :
		        	s = {"command": "send_data", "id": "Arduino_Raspberry_Temp_Hum", "timestamp": ts, "sensors_data" : {"temperature_sensor":sensor_temp,"humidity_sensor" : sensor_hum } }
		        	cloud.SendNotification("echo", json.dumps(s), 0)
		        
		    except dbus.DBusException as e:
		        print(e)


			print "\n";

		ard.close();

	except IOError, ioex.errno:
		print "I/O error ({0}): {1}".format(ioex.errno, ioex.strerror)
	except OSError:
	    raise OSError("Serial port not found. Try again")

if __name__ == '__main__' :
	parser = argparse.ArgumentParser()
	parser.add_argument('-p', '--port', type=str, default='/dev/ttyACM0', dest='port', required=False, help='Arduino serial port')
	r = parser.parse_args()
	port = r.port
	main()