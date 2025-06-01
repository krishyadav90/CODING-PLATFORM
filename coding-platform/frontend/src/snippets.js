const snippets = {
  "JavaScript Hello World": `console.log("Hello, World!");`,
  "JavaScript Factorial": `
function factorial(n) {
  if (n <= 1) return 1;
  return n * factorial(n - 1);
}
console.log(factorial(5));
  `.trim(),
  "JavaScript Palindrome": `
function isPalindrome(str) {
  const cleaned = str.toLowerCase().replace(/[^a-z0-9]/g, "");
  return cleaned === cleaned.split("").reverse().join("");
}
console.log(isPalindrome("Racecar")); // true
console.log(isPalindrome("Hello"));   // false
  `.trim(),
  "JavaScript Odd/Even Checker": `
function checkOddEven(number) {
  if (number % 2 === 0) {
    console.log(number + " is even.");
  } else {
    console.log(number + " is odd.");
  }
}
checkOddEven(7);  // 7 is odd.
checkOddEven(12); // 12 is even.
  `.trim(),
  "JavaScript Calculator": `
function calculator(a, b, operator) {
  switch(operator) {
    case '+': return a + b;
    case '-': return a - b;
    case '*': return a * b;
    case '/': return b !== 0 ? a / b : 'Error: Divide by zero';
    default: return 'Invalid operator';
  }
}
console.log(calculator(10, 5, '+')); // 15
console.log(calculator(10, 0, '/')); // Error: Divide by zero
  `.trim(),
  "Java Hello World": `
public class Main {
    public static void main(String[] args) {
        System.out.println("Hello, World!");
    }
}
  `.trim(),
  "Java Factorial": `
import java.util.Scanner;
public class Main {
    public static void main(String[] args) {
        Scanner scanner = new Scanner(System.in);
        System.out.print("Enter a number: ");
        int num = scanner.nextInt();
        long factorial = 1;
        for (int i = 1; i <= num; i++) {
            factorial *= i;
        }
        System.out.println("Factorial of " + num + " is: " + factorial);
        scanner.close();
    }
}
  `.trim(),
  "Java Palindrome Checker": `
import java.util.Scanner;
public class Main {
    public static void main(String[] args) {
        Scanner scanner = new Scanner(System.in);
        System.out.print("Enter a string: ");
        String input = scanner.nextLine();
        String reversed = new StringBuilder(input).reverse().toString();
        if (input.equals(reversed)) {
            System.out.println(input + " is a palindrome.");
        } else {
            System.out.println(input + " is not a palindrome.");
        }
        scanner.close();
    }
}
  `.trim(),
  "Java Odd/Even Checker": `
import java.util.Scanner;
public class Main {
    public static void main(String[] args) {
        Scanner scanner = new Scanner(System.in);
        System.out.print("Enter a number: ");
        int number = scanner.nextInt();
        if (number % 2 == 0) {
            System.out.println(number + " is even.");
        } else {
            System.out.println(number + " is odd.");
        }
        scanner.close();
    }
}
  `.trim(),
  "Java Calculator": `
import java.util.Scanner;
public class Main {
    public static void main(String[] args) {
        Scanner scanner = new Scanner(System.in);
        System.out.print("Enter first number: ");
        double a = scanner.nextDouble();
        System.out.print("Enter operator (+, -, *, /): ");
        char operator = scanner.next().charAt(0);
        System.out.print("Enter second number: ");
        double b = scanner.nextDouble();
        double result;
        switch (operator) {
            case '+':
                result = a + b;
                break;
            case '-':
                result = a - b;
                break;
            case '*':
                result = a * b;
                break;
            case '/':
                if (b != 0) {
                    result = a / b;
                } else {
                    System.out.println("Error: Divide by zero");
                    scanner.close();
                    return;
                }
                break;
            default:
                System.out.println("Invalid operator");
                scanner.close();
                return;
        }
        System.out.println("Result: " + result);
        scanner.close();
    }
}
  `.trim(),
  "Python Hello World": `
print("Hello, World!")
  `.trim(),
  "Python Factorial": `
def factorial(n):
    result = 1
    for i in range(1, n + 1):
        result *= i
    return result
print(factorial(5))  # Output: 120
  `.trim(),
  "Python Palindrome Checker": `
def is_palindrome(s):
    return s == s[::-1]
test_str = "racecar"
if is_palindrome(test_str):
    print(f'"{test_str}" is a palindrome.')
else:
    print(f'"{test_str}" is not a palindrome.')
  `.trim(),
  "Python Odd/Even Checker": `
def check_odd_even(number):
    if number % 2 == 0:
        print(f"{number} is even.")
    else:
        print(f"{number} is odd.")
check_odd_even(10)  # 10 is even.
check_odd_even(7)   # 7 is odd.
  `.trim(),
  "Python Calculator": `
def calculator(a, b, operator):
    if operator == '+':
        return a + b
    elif operator == '-':
        return a - b
    elif operator == '*':
        return a * b
    elif operator == '/':
        if b != 0:
            return a / b
        else:
            return "Error: Divide by zero"
    else:
        return "Invalid operator"
print(calculator(10, 5, '+'))  # 15
print(calculator(10, 0, '/'))  # Error: Divide by zero
  `.trim(),
  "C Hello World": `
#include <stdio.h>

int main() {
    printf("Hello, World!\\n");
    return 0;
}
  `.trim(),
 "C Factorial": `
#include <stdio.h>

int main() {
    int n, i;
    unsigned long long factorial = 1;

    printf("Enter a number: ");
    scanf("%d", &n);

    if (n < 0) {
        printf("Factorial is not defined for negative numbers.\\n");
        return 1;
    }

    for (i = 1; i <= n; ++i) {
        factorial *= i;
    }

    printf("Factorial of %d is %llu\\n", n, factorial);
    return 0;
}
  `.trim(),
  "C Palindrome Checker": `
#include <stdio.h>
#include <string.h>

int main() {
    char str[100], reversed[100];
    int len, i, j;

    printf("Enter a string: ");
    scanf("%s", str);

    len = strlen(str);
    for (i = 0, j = len - 1; i < len; i++, j--) {
        reversed[i] = str[j];
    }
    reversed[i] = '\\0';

    if (strcmp(str, reversed) == 0) {
        printf("%s is a palindrome.\\n", str);
    } else {
        printf("%s is not a palindrome.\\n", str);
    }

    return 0;
}
  `.trim(),
  "C Odd/Even Checker": `
#include <stdio.h>

int main() {
    int number;

    printf("Enter a number: ");
    scanf("%d", &number);

    if (number % 2 == 0) {
        printf("%d is even.\\n", number);
    } else {
        printf("%d is odd.\\n", number);
    }

    return 0;
}
  `.trim(),
  "C Calculator": `
#include <stdio.h>

int main() {
    double a, b, result;
    char operator;

    printf("Enter first number: ");
    scanf("%lf", &a);

    printf("Enter operator (+, -, *, /): ");
    scanf(" %c", &operator);

    printf("Enter second number: ");
    scanf("%lf", &b);

    switch (operator) {
        case '+':
            result = a + b;
            break;
        case '-':
            result = a - b;
            break;
        case '*':
            result = a * b;
            break;
        case '/':
            if (b != 0)
                result = a / b;
            else {
                printf("Error: Divide by zero\\n");
                return 1;
            }
            break;
        default:
            printf("Invalid operator\\n");
            return 1;
    }

    printf("Result: %.2lf\\n", result);
    return 0;
}
  `.trim(),
  "C++ Hello World": `
#include <iostream>
using namespace std;
int main() {
    cout << "Hello, World!" << endl;
    return 0;
}
  `.trim(),
  "C++ Factorial": `
#include <iostream>
using namespace std;
int main() {
    int n;
    unsigned long long factorial = 1;
    cout << "Enter a number: ";
    cin >> n;
    if (n < 0) {
        cout << "Factorial is not defined for negative numbers." << endl;
        return 1;
    }
    for (int i = 1; i <= n; ++i) {
        factorial *= i;
    }
    cout << "Factorial of " << n << " is " << factorial << endl;
    return 0;
}
  `.trim(),
  "C++ Palindrome Checker": `
#include <iostream>
#include <string>
#include <algorithm>
using namespace std;
int main() {
    string str, reversed;
    cout << "Enter a string: ";
    cin >> str;
    reversed = str;
    reverse(reversed.begin(), reversed.end());
    if (str == reversed) {
        cout << str << " is a palindrome." << endl;
    } else {
        cout << str << " is not a palindrome." << endl;
    }
    return 0;
}
  `.trim(),
  "C++ Odd/Even Checker": `
#include <iostream>
using namespace std;
int main() {
    int number;
    cout << "Enter a number: ";
    cin >> number;
    if (number % 2 == 0) {
        cout << number << " is even." << endl;
    } else {
        cout << number << " is odd." << endl;
    }
    return 0;
}
  `.trim(),
  "C++ Calculator": `
#include <iostream>
using namespace std;
int main() {
    double a, b, result;
    char op;
    cout << "Enter first number: ";
    cin >> a;
    cout << "Enter operator (+, -, *, /): ";
    cin >> op;
    cout << "Enter second number: ";
    cin >> b;
    switch(op) {
        case '+':
            result = a + b;
            break;
        case '-':
            result = a - b;
            break;
        case '*':
            result = a * b;
            break;
        case '/':
            if (b != 0)
                result = a / b;
            else {
                cout << "Error: Divide by zero" << endl;
                return 1;
            }
            break;
        default:
            cout << "Invalid operator" << endl;
            return 1;
    }
    cout << "Result: " << result << endl;
    return 0;
}
  `.trim(),
};

export default snippets;