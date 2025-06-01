import java.util.Scanner;

public class Main {
    public static void main(String[] args) {
        Scanner scanner = new Scanner(System.in);

        int number = scanner.nextInt();
        scanner.nextLine(); // consume newline
        String text = scanner.nextLine();

        System.out.println("Number: " + number);
        System.out.println("Text: " + text);

        // Factorial
        int factorial = 1;
        for (int i = 1; i <= number; i++) {
            factorial *= i;
        }
        System.out.println("Factorial: " + factorial);

        // Palindrome check
        String reversed = new StringBuilder(text).reverse().toString();
        System.out.println("Is Palindrome: " + text.equalsIgnoreCase(reversed));

        // Uppercase
        System.out.println("Uppercase: " + text.toUpperCase());

        scanner.close();
    }
}