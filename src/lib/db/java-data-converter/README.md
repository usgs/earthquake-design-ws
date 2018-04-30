# README

## Data Converter (Binary to CSV)

### Examples

1.  Run the following to build the Data Converter

```
./gradlew build
```

2.  This example runs the Data Converter class to convert a probabilistic binary data file to CSV format.

```
./gradlew run -Pargfile="/Users/usgs-golden/CODE/USGSII/AASHTO_2009/data/1998-HI-AASHTO-05-050-R1.rnd"
```

### Data Conversion Notes

The data files previously included data like "recordNumber,latitude,longitude,numValues,PGA,ss,s1,JUNK". However the database schema loads CSV files and expects "latitude,longitude,pga,s1,ss". Note the mismatch in order regarding ss/s1 between these two. The Converter.java currently reads the data as-is and creates a CSV output. These data were then post-processed to swap the Ss/S1 columns (Excel, etc...) to be ready for data loading. 

Use a simple application called ["Hex Fiend"](https://ridiculousfish.com/hexfiend/) to quickly look at the binary data manually. Using "Hex Fiend" you can tell whether the data file is in little endian format; so for Java these will need to be swapped.

In binary format we call each chunk of data a "record". In CSV format, this translates to a "line". In the data files, the header information is as follows (again, this is for the US file, the other files may be more or less similar but you will need to verify).

RECORD_NUMBER,LATITUDE,LONGITUDE,NUM_VALUES,Y0,Y1,...,YN,JUNK (This line is for labeling purposes in this email only and not part of the data file)
1,maxLatitude,minLongitude,3,0,0,0,JUNK
2,minLatitude,maxLongitude,3,0,0,0,JUNK
3,0,0,3,0,0.2,1.0,JUNK
4,50.0,-125.0,3,11.162,26.07,11.169,JUNK

In the above example, the first three records are header information. Specifically the third header line indicates the spectral periods (0.0, 0.2, 1.0) for the subsequent data. The final line above is the first line of the actual data. In the Java file you will see `input.seek(48)` (line: 18). This was skipping the header information in the previous data files. The record length (and subsequently header length) is a bit different in the current data files.

Int + Float + Float + Short + (Float x NUM_VALUES) + Short =
4 + 4 + 4 + 2 + (4 * NUM_VALUES) + 2 =
16 + (4 * NUM_VALUES)

In the example data file, NUM_VALUES = 3, so our overall record length = 
16 + (4 * 3) = 28

Since there are three header records, the overall header length is 84 bytes (or in hex, `input.seek(0x54);`). This may vary between each data file and should be checked.

Finally note that the binary data are in "%g" units whereas the database expects "g" (gravity). Hence the converter divides each value by 100 on its way out the door. As a sanity check, all the values should be in the range 0 - 2. Ss should typically be larger than S1.