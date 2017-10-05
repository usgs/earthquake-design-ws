# Quality Control Errata

This document attempts to explain discrepencies in the quality control
results.


## ASCE 7-05

### San Mateo (37.55, -122.3) Site Class A, Risk Category I
This discrepency is caused by rounding the output values to less precision
than the specified quality control tolerance.

Quality control tolorance is currently specificed as +/- 1E-4 (0.0001).
Results are reported rounded to the nearest 0.001. This combination of
quality control parameters is leading to a difference sufficent to
cause automated quality control tests to fail for this case. When
comparing un-rounded results for this location, the data are
as follows:

#### Sm1
```
+-------------------+---------------------+
|      Rounded      |       Precise       |
+--------+----------+----------+----------+
| Actual | Expected | Actual   | Expected |
+--------+----------+----------+----------+
| 0.716  | 0.717    | 0.716496 | 0.716502 |
+--------+----------+----------+----------+
```
> Precise actual vs expected differs by 0.000006 which is below the tolerance
> threshold of 0.0001.


### San Mateo (37.55, -122.3) Site Class E, Risk Category I
This discrepency is caused by rounding the output values to less precision
than the specified quality control tolerance.

Quality control tolorance is currently specificed as +/- 1E-4 (0.0001).
Results are reported rounded to the nearest 0.001. This combination of
quality control parameters is leading to a difference sufficent to
cause automated quality control tests to fail for this case. When
comparing un-rounded results for this location, the data are
as follows:

#### Sm1
```
+-------------------+---------------------+
|      Rounded      |       Precise       |
+--------+----------+----------+----------+
| Actual | Expected | Actual   | Expected |
+--------+----------+----------+----------+
| 2.149  | 2.15     | 2.149488 | 2.149506 |
+--------+----------+----------+----------+
```
> Precise actual vs expected differs by 0.000018 which is below the tolerance
> threshold of 0.0001.

