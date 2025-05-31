CREATE DATABASE login_demo;


CREATE TABLE `measurements_photo` (
  `photo_id` int(11) NOT NULL AUTO_INCREMENT,
  `measurement_id` int(11) NOT NULL,
  `photo_path` varchar(255) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`photo_id`),
  FOREIGN KEY (`measurement_id`) REFERENCES `measurements` (`measurement_id`) ON DELETE CASCADE
);



CREATE TABLE `purchase` (
  `purchase_id` int(11) NOT NULL AUTO_INCREMENT,
  `customer_id` int(11) NOT NULL,
  `total_amount` decimal(10,2) NOT NULL,
  `advance_amount` decimal(10,2) NOT NULL,
  `balance_amount` decimal(10,2) NOT NULL,
  `payment_method` varchar(50) NOT NULL,
  `status` enum('pending','in_progress','completed','delivered','cancelled') NOT NULL DEFAULT 'pending',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`purchase_id`),
  FOREIGN KEY (`customer_id`) REFERENCES `customer` (`customer_id`)
);

-- Create a junction table for purchase-measurement relationship
CREATE TABLE `purchase_measurements` (
  `purchase_id` int(11) NOT NULL,
  `measurement_id` int(11) NOT NULL,
  PRIMARY KEY (`purchase_id`, `measurement_id`),
  FOREIGN KEY (`purchase_id`) REFERENCES `purchase` (`purchase_id`) ON DELETE CASCADE,
  FOREIGN KEY (`measurement_id`) REFERENCES `measurements` (`measurement_id`) ON DELETE CASCADE
);

CREATE TABLE `assignments` (
  `assignment_id` INT(11) NOT NULL AUTO_INCREMENT,
  `purchase_id` INT(11) NOT NULL,
  `master_id` INT(11) NOT NULL,
  `in_date` DATE NOT NULL,
  `out_date` DATE DEFAULT NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`assignment_id`),
  FOREIGN KEY (`purchase_id`) REFERENCES `purchase`(`purchase_id`) ON DELETE CASCADE,
  FOREIGN KEY (`master_id`) REFERENCES `masters`(`master_id`) ON DELETE SET NULL
);




CREATE VIEW view_purchase_details AS


SELECT 
    p.purchase_id, 
    p.invoice_number, 
    p.total_amount, 
    p.advance_amount, 
    p.balance_amount, 
    p.payment_method, 
    p.created_at, 
    c.customer_id, 
    c.name AS customer_name, 
    c.phone, 
    c.whatsapp,
    m.measurement_id,
    m.name AS measurement_name,
    m.length,
    m.shoulder,
    m.arm,
    m.left_sleeve_length,
    m.left_sleeve_width,
    m.left_sleeve_arms,
    m.right_sleeve_length,
    m.right_sleeve_width,
    m.right_sleeve_arms,
    m.upper_body,
    m.middle_body,
    m.waist,
    m.dot_point,
    m.top_length,
    m.pant_length,
    m.hip,
    m.seat,
    m.thigh,
    m.maxi_length,
    m.maxi_height,
    m.skirt_length,
    m.skirt_height,
    m.others,
    m.created_at AS measurement_created_at,
    m.details,
    mp.photo_id,
    mp.photo_path,
    a.assignment_id,
    a.in_date,
    a.out_date,
    u.id AS master_id,
    CONCAT(u.first_name, ' ', u.last_name) AS master_name
FROM 
    purchase AS p
JOIN 
    customers AS c ON c.customer_id = p.customer_id
LEFT JOIN
    purchase_measurements AS pm ON p.purchase_id = pm.purchase_id
LEFT JOIN
    measurements AS m ON pm.measurement_id = m.measurement_id
LEFT JOIN
    measurements_photo AS mp ON m.measurement_id = mp.measurement_id
LEFT JOIN
    assignments AS a ON p.purchase_id = a.purchase_id
LEFT JOIN
    users AS u ON a.master_id = u.id
ORDER BY 
    p.purchase_id;
