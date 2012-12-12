package yugi.index;

import java.util.Arrays;

public class IndexPlayground {

	public static void main(String[] args) {
		System.out.println("Call of the Haunted:");
		String[] tokens = Indexer.tokenizeName("Call of the Haunted");
		Arrays.sort(tokens);
		System.out.println(Arrays.toString(tokens));
		
		System.out.println("Some-Card Name:");
		tokens = Indexer.tokenizeName("Some-Card Name");
		Arrays.sort(tokens);
		System.out.println(Arrays.toString(tokens));
		
		System.out.println("Fortune's Future:");
		tokens = Indexer.tokenizeName("Fortune's Future");
		Arrays.sort(tokens);
		System.out.println(Arrays.toString(tokens));
	}
}
