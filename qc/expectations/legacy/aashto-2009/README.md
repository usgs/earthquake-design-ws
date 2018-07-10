Batch requests and results from ...

https://earthquake.usgs.gov/designmaps/us/batch.php (accessed 4/10/2018)

... that are the basis for the AASHTO-2009 expectations.

Batch File Format (from https://earthquake.usgs.gov/designmaps/us/batch.php)

The user must create the batch file for uploading ahead of time. This file is a simple CSV file with the following format:

latitude,longitude,siteclass,riskcategory
latitude,longitude,siteclass,riskcategory
latitude,longitude,siteclass,riskcategory
    .        .         .          .
    .        .         .          .
    .        .         .          .
latitude,longitude,siteclass,riskcategory
	
Here latitude and longitude values should be in decimal degree format. Negative values denote western longitudes. The “siteclass” value is an integer between 0 and 4 where:

Integer Value,	Meaning
0,	Site Class A – “Hard Rock”
1,	Site Class B – “Rock”
2,	Site Class C – “Very Dense Soil and Soft Rock”
3,	Site Class D – “Stiff Soil”
4,	Site Class E – “Soft Clay Soil”

The “riskcategory” (or “occupancy category” in some code versions) value is an optional integer between -1 and 3 where:

Integer Value,	Meaning
-1,	N/A
0,	I - Low Hazard
1,	II - Other
2,	III - Substantial Hazard
3,	IV - Essential
