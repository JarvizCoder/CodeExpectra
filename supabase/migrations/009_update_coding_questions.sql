-- Update coding questions with test cases and console.log for direct execution

-- Delete existing coding/debugging/final questions and test cases to avoid conflicts
DELETE FROM test_cases WHERE question_id IN (
  '770e8400-e29b-41d4-a716-446655440006',
  '770e8400-e29b-41d4-a716-446655440007',
  '770e8400-e29b-41d4-a716-446655440008',
  '770e8400-e29b-41d4-a716-446655440009',
  '770e8400-e29b-41d4-a716-446655440010',
  '770e8400-e29b-41d4-a716-446655440011',
  '770e8400-e29b-41d4-a716-446655440012',
  '770e8400-e29b-41d4-a716-446655440013',
  '770e8400-e29b-41d4-a716-446655440014',
  '770e8400-e29b-41d4-a716-446655440015',
  '770e8400-e29b-41d4-a716-446655440016',
  '770e8400-e29b-41d4-a716-446655440017',
  '770e8400-e29b-41d4-a716-446655440018'
);

DELETE FROM questions WHERE id IN (
  '770e8400-e29b-41d4-a716-446655440006',
  '770e8400-e29b-41d4-a716-446655440007',
  '770e8400-e29b-41d4-a716-446655440008',
  '770e8400-e29b-41d4-a716-446655440009',
  '770e8400-e29b-41d4-a716-446655440010',
  '770e8400-e29b-41d4-a716-446655440011',
  '770e8400-e29b-41d4-a716-446655440012',
  '770e8400-e29b-41d4-a716-446655440013',
  '770e8400-e29b-41d4-a716-446655440014',
  '770e8400-e29b-41d4-a716-446655440015',
  '770e8400-e29b-41d4-a716-446655440016',
  '770e8400-e29b-41d4-a716-446655440017',
  '770e8400-e29b-41d4-a716-446655440018'
);

-- Insert coding questions for Round 2 (5 questions)
INSERT INTO questions (id, round_id, type, title, description, starter_code, reference_solution, language, difficulty, points, order_index)
VALUES
  ('770e8400-e29b-41d4-a716-446655440006', '660e8400-e29b-41d4-a716-446655440002', 'CODING', 'Two Sum', 'Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.', 'function twoSum(nums, target) {
  // Your code here
}

// Test
console.log(twoSum([2,7,11,15], 9));', 'function twoSum(nums, target) {
  const map = new Map();
  for (let i = 0; i < nums.length; i++) {
    const complement = target - nums[i];
    if (map.has(complement)) {
      return [map.get(complement), i];
    }
    map.set(nums[i], i);
  }
  return [];
}

console.log(twoSum([2,7,11,15], 9));', 'javascript', 'EASY', 20, 1),
  ('770e8400-e29b-41d4-a716-446655440007', '660e8400-e29b-41d4-a716-446655440002', 'CODING', 'Palindrome Check', 'Write a function to check if a string is a palindrome.', 'function isPalindrome(s) {
  // Your code here
}

// Test
console.log(isPalindrome("racecar"));', 'function isPalindrome(s) {
  const cleaned = s.toLowerCase().replace(/[^a-z0-9]/g, '''');
  return cleaned === cleaned.split('''').reverse().join('''');
}

console.log(isPalindrome("racecar"));', 'javascript', 'EASY', 20, 2),
  ('770e8400-e29b-41d4-a716-446655440010', '660e8400-e29b-41d4-a716-446655440002', 'CODING', 'FizzBuzz', 'Write a function that returns "Fizz" for multiples of 3, "Buzz" for multiples of 5, and "FizzBuzz" for multiples of both.', 'function fizzBuzz(n) {
  // Your code here
}

// Test
console.log(fizzBuzz(15));', 'function fizzBuzz(n) {
  if (n % 15 === 0) return "FizzBuzz";
  if (n % 3 === 0) return "Fizz";
  if (n % 5 === 0) return "Buzz";
  return n.toString();
}

console.log(fizzBuzz(15));', 'javascript', 'EASY', 20, 3),
  ('770e8400-e29b-41d4-a716-446655440011', '660e8400-e29b-41d4-a716-446655440002', 'CODING', 'Reverse String', 'Write a function to reverse a string.', 'function reverseString(s) {
  // Your code here
}

// Test
console.log(reverseString("hello"));', 'function reverseString(s) {
  return s.split('''').reverse().join('''');
}

console.log(reverseString("hello"));', 'javascript', 'EASY', 20, 4),
  ('770e8400-e29b-41d4-a716-446655440012', '660e8400-e29b-41d4-a716-446655440002', 'CODING', 'Find Maximum', 'Write a function to find the maximum number in an array.', 'function findMax(arr) {
  // Your code here
}

// Test
console.log(findMax([1,2,3,4,5]));', 'function findMax(arr) {
  return Math.max(...arr);
}

console.log(findMax([1,2,3,4,5]));', 'javascript', 'EASY', 20, 5)
ON CONFLICT DO NOTHING;

-- Insert test cases for coding questions (empty input since code has built-in tests)
INSERT INTO test_cases (id, question_id, input, expected_output, is_hidden, order_index)
VALUES
  ('990e8400-e29b-41d4-a716-446655440001', '770e8400-e29b-41d4-a716-446655440006', '', '[0,1]', false, 1),
  ('990e8400-e29b-41d4-a716-446655440002', '770e8400-e29b-41d4-a716-446655440006', '', '[1,2]', false, 2),
  ('990e8400-e29b-41d4-a716-446655440003', '770e8400-e29b-41d4-a716-446655440006', '', '[0,1]', true, 3),
  ('990e8400-e29b-41d4-a716-446655440004', '770e8400-e29b-41d4-a716-446655440007', '', 'true', false, 1),
  ('990e8400-e29b-41d4-a716-446655440005', '770e8400-e29b-41d4-a716-446655440007', '', 'false', false, 2),
  ('990e8400-e29b-41d4-a716-446655440006', '770e8400-e29b-41d4-a716-446655440007', '', 'true', true, 3),
  ('990e8400-e29b-41d4-a716-446655440012', '770e8400-e29b-41d4-a716-446655440010', '', 'FizzBuzz', false, 1),
  ('990e8400-e29b-41d4-a716-446655440013', '770e8400-e29b-41d4-a716-446655440010', '', 'Fizz', false, 2),
  ('990e8400-e29b-41d4-a716-446655440014', '770e8400-e29b-41d4-a716-446655440010', '', 'Buzz', false, 3),
  ('990e8400-e29b-41d4-a716-446655440015', '770e8400-e29b-41d4-a716-446655440010', '', '7', true, 4),
  ('990e8400-e29b-41d4-a716-446655440016', '770e8400-e29b-41d4-a716-446655440011', '', 'olleh', false, 1),
  ('990e8400-e29b-41d4-a716-446655440017', '770e8400-e29b-41d4-a716-446655440011', '', 'dlrow', false, 2),
  ('990e8400-e29b-41d4-a716-446655440018', '770e8400-e29b-41d4-a716-446655440011', '', 'a', true, 3),
  ('990e8400-e29b-41d4-a716-446655440019', '770e8400-e29b-41d4-a716-446655440012', '', '5', false, 1),
  ('990e8400-e29b-41d4-a716-446655440020', '770e8400-e29b-41d4-a716-446655440012', '', '20', false, 2),
  ('990e8400-e29b-41d4-a716-446655440021', '770e8400-e29b-41d4-a716-446655440012', '', '-1', true, 3)
ON CONFLICT DO NOTHING;

-- Insert debugging questions for Round 3 (5 questions)
INSERT INTO questions (id, round_id, type, title, description, starter_code, reference_solution, language, difficulty, points, order_index)
VALUES
  ('770e8400-e29b-41d4-a716-446655440008', '660e8400-e29b-41d4-a716-446655440003', 'DEBUGGING', 'Bug in Array Filter', 'Find and fix the bug in this array filter function.', 'function filterEvenNumbers(arr) {
  return arr.filter(num => num % 2 = 0);
}

// Test
console.log(filterEvenNumbers([1,2,3,4,5,6]));', 'function filterEvenNumbers(arr) {
  return arr.filter(num => num % 2 === 0);
}

console.log(filterEvenNumbers([1,2,3,4,5,6]));', 'javascript', 'EASY', 15, 1),
  ('770e8400-e29b-41d4-a716-446655440013', '660e8400-e29b-41d4-a716-446655440003', 'DEBUGGING', 'Bug in Loop', 'Find and fix the bug in this for loop that should sum numbers.', 'function sumArray(arr) {
  let sum = 0;
  for (let i = 0; i <= arr.length; i++) {
    sum += arr[i];
  }
  return sum;
}

// Test
console.log(sumArray([1,2,3,4,5]));', 'function sumArray(arr) {
  let sum = 0;
  for (let i = 0; i < arr.length; i++) {
    sum += arr[i];
  }
  return sum;
}

console.log(sumArray([1,2,3,4,5]));', 'javascript', 'EASY', 15, 2),
  ('770e8400-e29b-41d4-a716-446655440014', '660e8400-e29b-41d4-a716-446655440003', 'DEBUGGING', 'Bug in String Concatenation', 'Find and fix the bug in this string concatenation function.', 'function repeatString(str, n) {
  let result = "";
  for (let i = 0; i < n; i++);
  result += str;
  return result;
}

// Test
console.log(repeatString("abc", 3));', 'function repeatString(str, n) {
  let result = "";
  for (let i = 0; i < n; i++) {
    result += str;
  }
  return result;
}

console.log(repeatString("abc", 3));', 'javascript', 'EASY', 15, 3),
  ('770e8400-e29b-41d4-a716-446655440015', '660e8400-e29b-41d4-a716-446655440003', 'DEBUGGING', 'Bug in Array Map', 'Find and fix the bug in this map function that should double numbers.', 'function doubleArray(arr) {
  return arr.map(num => num * 2).push(0);
}

// Test
console.log(doubleArray([1,2,3]));', 'function doubleArray(arr) {
  return arr.map(num => num * 2);
}

console.log(doubleArray([1,2,3]));', 'javascript', 'EASY', 15, 4),
  ('770e8400-e29b-41d4-a716-446655440016', '660e8400-e29b-41d4-a716-446655440003', 'DEBUGGING', 'Bug in Condition', 'Find and fix the bug in this conditional check.', 'function isPositive(num) {
  if (num = 0) return "zero";
  if (num > 0) return "positive";
  return "negative";
}

// Test
console.log(isPositive(5));', 'function isPositive(num) {
  if (num === 0) return "zero";
  if (num > 0) return "positive";
  return "negative";
}

console.log(isPositive(5));', 'javascript', 'EASY', 15, 5)
ON CONFLICT DO NOTHING;

-- Insert test cases for debugging questions
INSERT INTO test_cases (id, question_id, input, expected_output, is_hidden, order_index)
VALUES
  ('990e8400-e29b-41d4-a716-446655440007', '770e8400-e29b-41d4-a716-446655440008', '', '[2,4,6]', false, 1),
  ('990e8400-e29b-41d4-a716-446655440008', '770e8400-e29b-41d4-a716-446655440008', '', '[]', false, 2),
  ('990e8400-e29b-41d4-a716-446655440022', '770e8400-e29b-41d4-a716-446655440013', '', '15', false, 1),
  ('990e8400-e29b-41d4-a716-446655440023', '770e8400-e29b-41d4-a716-446655440013', '', '60', false, 2),
  ('990e8400-e29b-41d4-a716-446655440024', '770e8400-e29b-41d4-a716-446655440014', '', 'abcabcabc', false, 1),
  ('990e8400-e29b-41d4-a716-446655440025', '770e8400-e29b-41d4-a716-446655440014', '', 'xxxxx', false, 2),
  ('990e8400-e29b-41d4-a716-446655440026', '770e8400-e29b-41d4-a716-446655440015', '', '[2,4,6]', false, 1),
  ('990e8400-e29b-41d4-a716-446655440027', '770e8400-e29b-41d4-a716-446655440015', '', '[10,20,30]', false, 2),
  ('990e8400-e29b-41d4-a716-446655440028', '770e8400-e29b-41d4-a716-446655440016', '', 'positive', false, 1),
  ('990e8400-e29b-41d4-a716-446655440029', '770e8400-e29b-41d4-a716-446655440016', '', 'negative', false, 2),
  ('990e8400-e29b-41d4-a716-446655440030', '770e8400-e29b-41d4-a716-446655440016', '', 'zero', true, 3)
ON CONFLICT DO NOTHING;

-- Insert final battle questions for Round 4 (3 questions)
INSERT INTO questions (id, round_id, type, title, description, starter_code, reference_solution, language, difficulty, points, order_index)
VALUES
  ('770e8400-e29b-41d4-a716-446655440009', '660e8400-e29b-41d4-a716-446655440004', 'CODING', 'Binary Search', 'Implement binary search algorithm.', 'function binarySearch(arr, target) {
  // Your code here
}

// Test
console.log(binarySearch([1,2,3,4,5,6,7,8,9,10], 5));', 'function binarySearch(arr, target) {
  let left = 0;
  let right = arr.length - 1;
  while (left <= right) {
    const mid = Math.floor((left + right) / 2);
    if (arr[mid] === target) return mid;
    if (arr[mid] < target) left = mid + 1;
    else right = mid - 1;
  }
  return -1;
}

console.log(binarySearch([1,2,3,4,5,6,7,8,9,10], 5));', 'javascript', 'MEDIUM', 30, 1),
  ('770e8400-e29b-41d4-a716-446655440017', '660e8400-e29b-41d4-a716-446655440004', 'CODING', 'Merge Two Sorted Arrays', 'Merge two sorted arrays into one sorted array.', 'function mergeArrays(arr1, arr2) {
  // Your code here
}

// Test
console.log(mergeArrays([1,3,5], [2,4,6]));', 'function mergeArrays(arr1, arr2) {
  const result = [];
  let i = 0, j = 0;
  while (i < arr1.length && j < arr2.length) {
    if (arr1[i] < arr2[j]) result.push(arr1[i++]);
    else result.push(arr2[j++]);
  }
  return result.concat(arr1.slice(i)).concat(arr2.slice(j));
}

console.log(mergeArrays([1,3,5], [2,4,6]));', 'javascript', 'MEDIUM', 30, 2),
  ('770e8400-e29b-41d4-a716-446655440018', '660e8400-e29b-41d4-a716-446655440004', 'CODING', 'Longest Common Prefix', 'Find the longest common prefix string amongst an array of strings.', 'function longestCommonPrefix(strs) {
  // Your code here
}

// Test
console.log(longestCommonPrefix(["flower","flow","flight"]));', 'function longestCommonPrefix(strs) {
  if (!strs.length) return "";
  let prefix = strs[0];
  for (let i = 1; i < strs.length; i++) {
    while (strs[i].indexOf(prefix) !== 0) {
      prefix = prefix.slice(0, -1);
      if (!prefix) return "";
    }
  }
  return prefix;
}

console.log(longestCommonPrefix(["flower","flow","flight"]));', 'javascript', 'MEDIUM', 30, 3)
ON CONFLICT DO NOTHING;

-- Insert test cases for final battle
INSERT INTO test_cases (id, question_id, input, expected_output, is_hidden, order_index)
VALUES
  ('990e8400-e29b-41d4-a716-446655440009', '770e8400-e29b-41d4-a716-446655440009', '', '4', false, 1),
  ('990e8400-e29b-41d4-a716-446655440010', '770e8400-e29b-41d4-a716-446655440009', '', '-1', false, 2),
  ('990e8400-e29b-41d4-a716-446655440011', '770e8400-e29b-41d4-a716-446655440009', '', '0', true, 3),
  ('990e8400-e29b-41d4-a716-446655440031', '770e8400-e29b-41d4-a716-446655440017', '', '[1,2,3,4,5,6]', false, 1),
  ('990e8400-e29b-41d4-a716-446655440032', '770e8400-e29b-41d4-a716-446655440017', '', '[1,1,2,3,4,4]', false, 2),
  ('990e8400-e29b-41d4-a716-446655440033', '770e8400-e29b-41d4-a716-446655440017', '', '[1]', true, 3),
  ('990e8400-e29b-41d4-a716-446655440034', '770e8400-e29b-41d4-a716-446655440018', '', 'fl', false, 1),
  ('990e8400-e29b-41d4-a716-446655440035', '770e8400-e29b-41d4-a716-446655440018', '', '', false, 2),
  ('990e8400-e29b-41d4-a716-446655440036', '770e8400-e29b-41d4-a716-446655440018', '', 'inters', true, 3)
ON CONFLICT DO NOTHING;
