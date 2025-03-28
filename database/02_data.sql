INSERT INTO `taxtracker`.`employment_sector` (id, employment_sector_name) VALUES
(1, 'Healthcare'),
(2, 'Education'),
(3, 'Technology'),
(4, 'Finance'),
(5, 'Retail'),
(6, 'Construction'),
(7, 'Transportation'),
(8, 'Hospitality'),
(9, 'Government'),
(10, 'Legal');

INSERT INTO `taxtracker`.`client` (id, first_name, last_name, ssn, dob, phone, email, address1, address2, city, state, zip, employment_sector_id, hashed_ssn) VALUES
(1, 'Alice', 'Smith', '111223333', '1985-01-01', '5551110001', 'alice@example.com', '123 Main St', '', 'Orlando', 'FL', '32801', 1, 'hash_1'),
(2, 'Bob', 'Jones', '222334444', '1978-02-02', '5551110002', 'bob@example.com', '456 Elm St', 'Apt 2', 'Miami', 'FL', '33101', 2, 'hash_2'),
(3, 'Carol', 'Brown', '333445555', '1990-03-03', '5551110003', 'carol@example.com', '789 Oak St', '', 'Tampa', 'FL', '33601', 3, 'hash_3'),
(4, 'David', 'Taylor', '444556666', '1982-04-04', '5551110004', 'david@example.com', '321 Pine St', '', 'Jacksonville', 'FL', '32201', 4, 'hash_4'),
(5, 'Eve', 'Wilson', '555667777', '1995-05-05', '5551110005', 'eve@example.com', '654 Cedar St', '', 'Tallahassee', 'FL', '32301', 5, 'hash_5'),
(6, 'Frank', 'Martinez', '666778888', '1988-06-06', '5551110006', 'frank@example.com', '987 Birch St', '', 'Gainesville', 'FL', '32601', 6, 'hash_6'),
(7, 'Grace', 'Lee', '777889999', '1992-07-07', '5551110007', 'grace@example.com', '159 Spruce St', '', 'Sarasota', 'FL', '34231', 7, 'hash_7'),
(8, 'Henry', 'White', '888990000', '1980-08-08', '5551110008', 'henry@example.com', '753 Willow St', '', 'St. Pete', 'FL', '33701', 8, 'hash_8'),
(9, 'Isla', 'Harris', '999001111', '1991-09-09', '5551110009', 'isla@example.com', '852 Maple St', '', 'Clearwater', 'FL', '33755', 9, 'hash_9'),
(10, 'Jack', 'Clark', '000112222', '1983-10-10', '5551110010', 'jack@example.com', '951 Palm St', '', 'Naples', 'FL', '34102', 10, 'hash_10');

INSERT INTO `taxtracker`.`cpa` (id, first_name, last_name, license, phone, email, address1, address2, city, state, zip) VALUES
(1, 'Laura', 'Green', 'CPA001', '5552220001', 'laura@cpa.com', '10 Cypress Rd', '', 'Orlando', 'FL', '32801'),
(2, 'Mark', 'Young', 'CPA002', '5552220002', 'mark@cpa.com', '20 River Rd', '', 'Miami', 'FL', '33101'),
(3, 'Nina', 'Hall', 'CPA003', '5552220003', 'nina@cpa.com', '30 Forest Ln', '', 'Tampa', 'FL', '33601'),
(4, 'Owen', 'Adams', 'CPA004', '5552220004', 'owen@cpa.com', '40 Lakeview Dr', '', 'Jacksonville', 'FL', '32201'),
(5, 'Paula', 'Nelson', 'CPA005', '5552220005', 'paula@cpa.com', '50 Garden St', '', 'Tallahassee', 'FL', '32301'),
(6, 'Quinn', 'Wright', 'CPA006', '5552220006', 'quinn@cpa.com', '60 Sunset Blvd', '', 'Gainesville', 'FL', '32601'),
(7, 'Rita', 'Scott', 'CPA007', '5552220007', 'rita@cpa.com', '70 Beach Dr', '', 'Sarasota', 'FL', '34231'),
(8, 'Sam', 'Turner', 'CPA008', '5552220008', 'sam@cpa.com', '80 Ocean Blvd', '', 'St. Pete', 'FL', '33701'),
(9, 'Tina', 'Perez', 'CPA009', '5552220009', 'tina@cpa.com', '90 Coral Way', '', 'Clearwater', 'FL', '33755'),
(10, 'Umar', 'Cruz', 'CPA010', '5552220010', 'umar@cpa.com', '100 Marina Dr', '', 'Naples', 'FL', '34102');

INSERT INTO `taxtracker`.`tax_return` (id, client_id, cpa_id, year, status, amount_paid, amount_owed, cost, employment_sector_id, total_income, adjustments, filing_status) VALUES
(1, 1, 1, 2022, 'Filed', 1000.00, 500.00, 200.00, 1, 60000.00, 5000.00, 'Single'),
(2, 2, 2, 2022, 'Filed', 1500.00, 0.00, 200.00, 2, 72000.00, 3000.00, 'Married'),
(3, 3, 3, 2022, 'Filed', 500.00, 800.00, 200.00, 3, 58000.00, 0.00, 'Single'),
(4, 4, 4, 2022, 'Filed', 700.00, 200.00, 200.00, 4, 49000.00, 1000.00, 'Head of Household'),
(5, 5, 5, 2022, 'Filed', 1200.00, 100.00, 200.00, 5, 84000.00, 2000.00, 'Married'),
(6, 6, 6, 2022, 'Filed', 900.00, 0.00, 200.00, 6, 76000.00, 4000.00, 'Single'),
(7, 7, 7, 2022, 'Filed', 1100.00, 600.00, 200.00, 7, 65000.00, 2500.00, 'Head of Household'),
(8, 8, 8, 2022, 'Filed', 300.00, 0.00, 200.00, 8, 44000.00, 3000.00, 'Single'),
(9, 9, 9, 2022, 'Filed', 100.00, 700.00, 200.00, 9, 50000.00, 1500.00, 'Single'),
(10, 10, 10, 2022, 'Filed', 950.00, 200.00, 200.00, 10, 93000.00, 2000.00, 'Married');

INSERT INTO `taxtracker`.`payment` (amount, date, return_id, method) VALUES
(200.00, '2023-01-01', 1, 'Credit Card'),
(200.00, '2023-01-02', 2, 'Debit Card'),
(200.00, '2023-01-03', 3, 'Cash'),
(200.00, '2023-01-04', 4, 'Check'),
(200.00, '2023-01-05', 5, 'Credit Card'),
(200.00, '2023-01-06', 6, 'Credit Card'),
(200.00, '2023-01-07', 7, 'ACH Transfer'),
(200.00, '2023-01-08', 8, 'Cash'),
(200.00, '2023-01-09', 9, 'Debit Card'),
(200.00, '2023-01-10', 10, 'Check');

