-- Seed data for CodeBattle demo

-- Insert demo event
INSERT INTO events (id, name, description, start_time, end_time)
VALUES (
  '550e8400-e29b-41d4-a716-446655440000',
  'CodeBattle Hackathon 2024',
  'Annual coding competition for developers',
  NOW(),
  NOW() + INTERVAL '30 days'
) ON CONFLICT DO NOTHING;

-- Insert demo rounds
INSERT INTO rounds (id, event_id, name, type, description, start_time, end_time, duration_minutes, status, points_per_question, negative_marking, negative_percentage, qualification_percent)
VALUES
  ('660e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440000', 'Quiz Battle', 'QUIZ', 'Test your knowledge with multiple-choice questions', NOW(), NOW() + INTERVAL '7 days', 30, 'OPEN', 10, true, 25, 50),
  ('660e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440000', 'Coding Battle', 'CODING', 'Solve programming challenges', NOW() + INTERVAL '1 day', NOW() + INTERVAL '8 days', 60, 'LOCKED', 20, false, 0, 50),
  ('660e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440000', 'Debugging Battle', 'DEBUGGING', 'Find and fix bugs in code', NOW() + INTERVAL '2 days', NOW() + INTERVAL '9 days', 45, 'LOCKED', 15, false, 0, 50),
  ('660e8400-e29b-41d4-a716-446655440004', '550e8400-e29b-41d4-a716-446655440000', 'Final Battle', 'FINAL', 'Advanced programming challenges for finalists', NOW() + INTERVAL '3 days', NOW() + INTERVAL '10 days', 90, 'LOCKED', 30, false, 0, 50)
ON CONFLICT DO NOTHING;

-- Insert quiz questions for Round 1
INSERT INTO questions (id, round_id, type, title, description, difficulty, points, order_index)
VALUES
  ('770e8400-e29b-41d4-a716-446655440001', '660e8400-e29b-41d4-a716-446655440001', 'QUIZ', 'JavaScript Basics', 'What is the output of typeof null in JavaScript?', 'EASY', 10, 1),
  ('770e8400-e29b-41d4-a716-446655440002', '660e8400-e29b-41d4-a716-446655440001', 'QUIZ', 'React Hooks', 'Which hook is used for side effects in React?', 'EASY', 10, 2),
  ('770e8400-e29b-41d4-a716-446655440003', '660e8400-e29b-41d4-a716-446655440001', 'QUIZ', 'CSS Flexbox', 'Which property aligns items in a flex container?', 'EASY', 10, 3),
  ('770e8400-e29b-41d4-a716-446655440004', '660e8400-e29b-41d4-a716-446655440001', 'QUIZ', 'Database Indexes', 'What is the primary purpose of database indexes?', 'MEDIUM', 10, 4),
  ('770e8400-e29b-41d4-a716-446655440005', '660e8400-e29b-41d4-a716-446655440001', 'QUIZ', 'HTTP Methods', 'Which HTTP method is used to update an existing resource?', 'EASY', 10, 5)
ON CONFLICT DO NOTHING;

-- Insert quiz options
INSERT INTO question_options (id, question_id, option_text, is_correct, order_index)
VALUES
  -- Question 1 options
  ('880e8400-e29b-41d4-a716-446655440001', '770e8400-e29b-41d4-a716-446655440001', 'object', false, 1),
  ('880e8400-e29b-41d4-a716-446655440002', '770e8400-e29b-41d4-a716-446655440001', 'null', false, 2),
  ('880e8400-e29b-41d4-a716-446655440003', '770e8400-e29b-41d4-a716-446655440001', 'object', true, 3),
  ('880e8400-e29b-41d4-a716-446655440004', '770e8400-e29b-41d4-a716-446655440001', 'undefined', false, 4),
  -- Question 2 options
  ('880e8400-e29b-41d4-a716-446655440005', '770e8400-e29b-41d4-a716-446655440002', 'useState', false, 1),
  ('880e8400-e29b-41d4-a716-446655440006', '770e8400-e29b-41d4-a716-446655440002', 'useEffect', true, 2),
  ('880e8400-e29b-41d4-a716-446655440007', '770e8400-e29b-41d4-a716-446655440002', 'useContext', false, 3),
  ('880e8400-e29b-41d4-a716-446655440008', '770e8400-e29b-41d4-a716-446655440002', 'useReducer', false, 4),
  -- Question 3 options
  ('880e8400-e29b-41d4-a716-446655440009', '770e8400-e29b-41d4-a716-446655440003', 'align-items', true, 1),
  ('880e8400-e29b-41d4-a716-446655440010', '770e8400-e29b-41d4-a716-446655440003', 'justify-content', false, 2),
  ('880e8400-e29b-41d4-a716-446655440011', '770e8400-e29b-41d4-a716-446655440003', 'flex-direction', false, 3),
  ('880e8400-e29b-41d4-a716-446655440012', '770e8400-e29b-41d4-a716-446655440003', 'flex-wrap', false, 4),
  -- Question 4 options
  ('880e8400-e29b-41d4-a716-446655440013', '770e8400-e29b-41d4-a716-446655440004', 'To store more data', false, 1),
  ('880e8400-e29b-41d4-a716-446655440014', '770e8400-e29b-41d4-a716-446655440004', 'To improve query performance', true, 2),
  ('880e8400-e29b-41d4-a716-446655440015', '770e8400-e29b-41d4-a716-446655440004', 'To encrypt data', false, 3),
  ('880e8400-e29b-41d4-a716-446655440016', '770e8400-e29b-41d4-a716-446655440004', 'To backup data', false, 4),
  -- Question 5 options
  ('880e8400-e29b-41d4-a716-446655440017', '770e8400-e29b-41d4-a716-446655440005', 'POST', false, 1),
  ('880e8400-e29b-41d4-a716-446655440018', '770e8400-e29b-41d4-a716-446655440005', 'PUT', true, 2),
  ('880e8400-e29b-41d4-a716-446655440019', '770e8400-e29b-41d4-a716-446655440005', 'GET', false, 3),
  ('880e8400-e29b-41d4-a716-446655440020', '770e8400-e29b-41d4-a716-446655440005', 'DELETE', false, 4)
ON CONFLICT DO NOTHING;

-- Insert coding questions for Round 2
INSERT INTO questions (id, round_id, type, title, description, starter_code, reference_solution, language, difficulty, points, order_index)
VALUES
  ('770e8400-e29b-41d4-a716-446655440006', '660e8400-e29b-41d4-a716-446655440002', 'CODING', 'Two Sum', 'Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.', 'function twoSum(nums, target) {\n  // Your code here\n}\n\n// Test\nconsole.log(twoSum([2,7,11,15], 9));', 'function twoSum(nums, target) {\n  const map = new Map();\n  for (let i = 0; i < nums.length; i++) {\n    const complement = target - nums[i];\n    if (map.has(complement)) {\n      return [map.get(complement), i];\n    }\n    map.set(nums[i], i);\n  }\n  return [];\n}\n\nconsole.log(twoSum([2,7,11,15], 9));', 'javascript', 'EASY', 20, 1),
  ('770e8400-e29b-41d4-a716-446655440007', '660e8400-e29b-41d4-a716-446655440002', 'CODING', 'Palindrome Check', 'Write a function to check if a string is a palindrome.', 'function isPalindrome(s) {\n  // Your code here\n}\n\n// Test\nconsole.log(isPalindrome("racecar"));', 'function isPalindrome(s) {\n  const cleaned = s.toLowerCase().replace(/[^a-z0-9]/g, '''');\n  return cleaned === cleaned.split('''').reverse().join('''');\n}\n\nconsole.log(isPalindrome("racecar"));', 'javascript', 'EASY', 20, 2),
  ('770e8400-e29b-41d4-a716-446655440010', '660e8400-e29b-41d4-a716-446655440002', 'CODING', 'FizzBuzz', 'Write a function that returns "Fizz" for multiples of 3, "Buzz" for multiples of 5, and "FizzBuzz" for multiples of both.', 'function fizzBuzz(n) {\n  // Your code here\n}\n\n// Test\nconsole.log(fizzBuzz(15));', 'function fizzBuzz(n) {\n  if (n % 15 === 0) return "FizzBuzz";\n  if (n % 3 === 0) return "Fizz";\n  if (n % 5 === 0) return "Buzz";\n  return n.toString();\n}\n\nconsole.log(fizzBuzz(15));', 'javascript', 'EASY', 20, 3),
  ('770e8400-e29b-41d4-a716-446655440011', '660e8400-e29b-41d4-a716-446655440002', 'CODING', 'Reverse String', 'Write a function to reverse a string.', 'function reverseString(s) {\n  // Your code here\n}\n\n// Test\nconsole.log(reverseString("hello"));', 'function reverseString(s) {\n  return s.split('''').reverse().join('''');\n}\n\nconsole.log(reverseString("hello"));', 'javascript', 'EASY', 20, 4),
  ('770e8400-e29b-41d4-a716-446655440012', '660e8400-e29b-41d4-a716-446655440002', 'CODING', 'Find Maximum', 'Write a function to find the maximum number in an array.', 'function findMax(arr) {\n  // Your code here\n}\n\n// Test\nconsole.log(findMax([1,2,3,4,5]));', 'function findMax(arr) {\n  return Math.max(...arr);\n}\n\nconsole.log(findMax([1,2,3,4,5]));', 'javascript', 'EASY', 20, 5)
ON CONFLICT DO NOTHING;

-- Insert test cases for coding questions
INSERT INTO test_cases (id, question_id, input, expected_output, is_hidden, order_index)
VALUES
  -- Two Sum test cases
  ('990e8400-e29b-41d4-a716-446655440001', '770e8400-e29b-41d4-a716-446655440006', '', '[0,1]', false, 1),
  ('990e8400-e29b-41d4-a716-446655440002', '770e8400-e29b-41d4-a716-446655440006', '', '[1,2]', false, 2),
  ('990e8400-e29b-41d4-a716-446655440003', '770e8400-e29b-41d4-a716-446655440006', '', '[0,1]', true, 3),
  -- Palindrome test cases
  ('990e8400-e29b-41d4-a716-446655440004', '770e8400-e29b-41d4-a716-446655440007', '', 'true', false, 1),
  ('990e8400-e29b-41d4-a716-446655440005', '770e8400-e29b-41d4-a716-446655440007', '', 'false', false, 2),
  ('990e8400-e29b-41d4-a716-446655440006', '770e8400-e29b-41d4-a716-446655440007', '', 'true', true, 3),
  -- FizzBuzz test cases
  ('990e8400-e29b-41d4-a716-446655440012', '770e8400-e29b-41d4-a716-446655440010', '', 'FizzBuzz', false, 1),
  ('990e8400-e29b-41d4-a716-446655440013', '770e8400-e29b-41d4-a716-446655440010', '', 'Fizz', false, 2),
  ('990e8400-e29b-41d4-a716-446655440014', '770e8400-e29b-41d4-a716-446655440010', '', 'Buzz', false, 3),
  ('990e8400-e29b-41d4-a716-446655440015', '770e8400-e29b-41d4-a716-446655440010', '', '7', true, 4),
  -- Reverse String test cases
  ('990e8400-e29b-41d4-a716-446655440016', '770e8400-e29b-41d4-a716-446655440011', '', 'olleh', false, 1),
  ('990e8400-e29b-41d4-a716-446655440017', '770e8400-e29b-41d4-a716-446655440011', '', 'dlrow', false, 2),
  ('990e8400-e29b-41d4-a716-446655440018', '770e8400-e29b-41d4-a716-446655440011', '', 'a', true, 3),
  -- Find Maximum test cases
  ('990e8400-e29b-41d4-a716-446655440019', '770e8400-e29b-41d4-a716-446655440012', '', '5', false, 1),
  ('990e8400-e29b-41d4-a716-446655440020', '770e8400-e29b-41d4-a716-446655440012', '', '20', false, 2),
  ('990e8400-e29b-41d4-a716-446655440021', '770e8400-e29b-41d4-a716-446655440012', '', '-1', true, 3)
ON CONFLICT DO NOTHING;

-- Insert debugging questions for Round 3
INSERT INTO questions (id, round_id, type, title, description, starter_code, reference_solution, language, difficulty, points, order_index)
VALUES
  ('770e8400-e29b-41d4-a716-446655440008', '660e8400-e29b-41d4-a716-446655440003', 'DEBUGGING', 'Bug in Array Filter', 'Find and fix the bug in this array filter function.', 'function filterEvenNumbers(arr) {\n  return arr.filter(num => num % 2 = 0);\n}\n\n// Test\nconsole.log(filterEvenNumbers([1,2,3,4,5,6]));', 'function filterEvenNumbers(arr) {\n  return arr.filter(num => num % 2 === 0);\n}\n\nconsole.log(filterEvenNumbers([1,2,3,4,5,6]));', 'javascript', 'EASY', 15, 1),
  ('770e8400-e29b-41d4-a716-446655440013', '660e8400-e29b-41d4-a716-446655440003', 'DEBUGGING', 'Bug in Loop', 'Find and fix the bug in this for loop that should sum numbers.', 'function sumArray(arr) {\n  let sum = 0;\n  for (let i = 0; i <= arr.length; i++) {\n    sum += arr[i];\n  }\n  return sum;\n}\n\n// Test\nconsole.log(sumArray([1,2,3,4,5]));', 'function sumArray(arr) {\n  let sum = 0;\n  for (let i = 0; i < arr.length; i++) {\n    sum += arr[i];\n  }\n  return sum;\n}\n\nconsole.log(sumArray([1,2,3,4,5]));', 'javascript', 'EASY', 15, 2),
  ('770e8400-e29b-41d4-a716-446655440014', '660e8400-e29b-41d4-a716-446655440003', 'DEBUGGING', 'Bug in String Concatenation', 'Find and fix the bug in this string concatenation function.', 'function repeatString(str, n) {\n  let result = "";\n  for (let i = 0; i < n; i++);\n  result += str;\n  return result;\n}\n\n// Test\nconsole.log(repeatString("abc", 3));', 'function repeatString(str, n) {\n  let result = "";\n  for (let i = 0; i < n; i++) {\n    result += str;\n  }\n  return result;\n}\n\nconsole.log(repeatString("abc", 3));', 'javascript', 'EASY', 15, 3),
  ('770e8400-e29b-41d4-a716-446655440015', '660e8400-e29b-41d4-a716-446655440003', 'DEBUGGING', 'Bug in Array Map', 'Find and fix the bug in this map function that should double numbers.', 'function doubleArray(arr) {\n  return arr.map(num => num * 2).push(0);\n}\n\n// Test\nconsole.log(doubleArray([1,2,3]));', 'function doubleArray(arr) {\n  return arr.map(num => num * 2);\n}\n\nconsole.log(doubleArray([1,2,3]));', 'javascript', 'EASY', 15, 4),
  ('770e8400-e29b-41d4-a716-446655440016', '660e8400-e29b-41d4-a716-446655440003', 'DEBUGGING', 'Bug in Condition', 'Find and fix the bug in this conditional check.', 'function isPositive(num) {\n  if (num = 0) return "zero";\n  if (num > 0) return "positive";\n  return "negative";\n}\n\n// Test\nconsole.log(isPositive(5));', 'function isPositive(num) {\n  if (num === 0) return "zero";\n  if (num > 0) return "positive";\n  return "negative";\n}\n\nconsole.log(isPositive(5));', 'javascript', 'EASY', 15, 5)
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

-- Insert final battle questions for Round 4
INSERT INTO questions (id, round_id, type, title, description, starter_code, reference_solution, language, difficulty, points, order_index)
VALUES
  ('770e8400-e29b-41d4-a716-446655440009', '660e8400-e29b-41d4-a716-446655440004', 'CODING', 'Binary Search', 'Implement binary search algorithm.', 'function binarySearch(arr, target) {\n  // Your code here\n}\n\n// Test\nconsole.log(binarySearch([1,2,3,4,5,6,7,8,9,10], 5));', 'function binarySearch(arr, target) {\n  let left = 0;\n  let right = arr.length - 1;\n  while (left <= right) {\n    const mid = Math.floor((left + right) / 2);\n    if (arr[mid] === target) return mid;\n    if (arr[mid] < target) left = mid + 1;\n    else right = mid - 1;\n  }\n  return -1;\n}\n\nconsole.log(binarySearch([1,2,3,4,5,6,7,8,9,10], 5));', 'javascript', 'MEDIUM', 30, 1),
  ('770e8400-e29b-41d4-a716-446655440017', '660e8400-e29b-41d4-a716-446655440004', 'CODING', 'Merge Two Sorted Arrays', 'Merge two sorted arrays into one sorted array.', 'function mergeArrays(arr1, arr2) {\n  // Your code here\n}\n\n// Test\nconsole.log(mergeArrays([1,3,5], [2,4,6]));', 'function mergeArrays(arr1, arr2) {\n  const result = [];\n  let i = 0, j = 0;\n  while (i < arr1.length && j < arr2.length) {\n    if (arr1[i] < arr2[j]) result.push(arr1[i++]);\n    else result.push(arr2[j++]);\n  }\n  return result.concat(arr1.slice(i)).concat(arr2.slice(j));\n}\n\nconsole.log(mergeArrays([1,3,5], [2,4,6]));', 'javascript', 'MEDIUM', 30, 2),
  ('770e8400-e29b-41d4-a716-446655440018', '660e8400-e29b-41d4-a716-446655440004', 'CODING', 'Longest Common Prefix', 'Find the longest common prefix string amongst an array of strings.', 'function longestCommonPrefix(strs) {\n  // Your code here\n}\n\n// Test\nconsole.log(longestCommonPrefix(["flower","flow","flight"]));', 'function longestCommonPrefix(strs) {\n  if (!strs.length) return "";\n  let prefix = strs[0];\n  for (let i = 1; i < strs.length; i++) {\n    while (strs[i].indexOf(prefix) !== 0) {\n      prefix = prefix.slice(0, -1);\n      if (!prefix) return "";\n    }\n  }\n  return prefix;\n}\n\nconsole.log(longestCommonPrefix(["flower","flow","flight"]));', 'javascript', 'MEDIUM', 30, 3)
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
