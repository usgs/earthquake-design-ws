import java.io.RandomAccessFile;
import java.io.EOFException;
import org.apache.commons.io.EndianUtils;

/**
 * Converts binary to csv. 
 */

public class Converter {
  public static void main (String [] args) throws Exception {
    String fileName;

    fileName = args[0];
    RandomAccessFile input = new RandomAccessFile(fileName, "r");
    System.err.println("MAPPED_SS and MAPPED_S1 need to be switched");
    System.out.println("LATITUDE,LONGITUDE,MAPPED_PGA,MAPPED_SS,MAPPED_S1");
    try {
      input.seek(0x48);
      while (true) {
        printRecord(input);
      }
    } catch (EOFException eof) {
      /* ignore we are done */
    }
  }

  public static void printRecord (RandomAccessFile input) throws Exception {
    float latitude, longitude, value, value2;
    int recordNumber;
    short numValues;

    // SA values
    recordNumber = EndianUtils.swapInteger(input.readInt());
    latitude = Float.intBitsToFloat(EndianUtils.swapInteger(input.readInt()));
    longitude = Float.intBitsToFloat(EndianUtils.swapInteger(input.readInt()));
    numValues = EndianUtils.swapShort(input.readShort());

    System.out.printf("%.2f, %.2f,null", latitude, longitude, null);

    for (int i = 0; i < numValues; ++i) {
      value = Float.intBitsToFloat(EndianUtils.swapInteger(input.readInt()));
      value /= 100;

      System.out.printf(",%f", value);
    }

    /* Realign to byte boundry */
    input.readShort();

    System.out.println();
  }
}
