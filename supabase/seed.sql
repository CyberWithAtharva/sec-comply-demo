-- ============================================================
-- SecComply: Seed Data
-- Frameworks + Controls for SOC 2 Type II, ISO 27001, NIST CSF
-- ============================================================

-- ============================================================
-- SOC 2 TYPE II
-- ============================================================
INSERT INTO frameworks (id, name, version, description, controls_count) VALUES
    ('f1000000-0000-0000-0000-000000000001', 'SOC 2 Type II', '2017', 'AICPA Trust Services Criteria for security, availability, processing integrity, confidentiality, and privacy.', 61);

INSERT INTO controls (framework_id, control_id, domain, category, title, description, type) VALUES
-- CC1: Control Environment
('f1000000-0000-0000-0000-000000000001', 'CC1.1', 'Security', 'CC1: Control Environment', 'COSO Principle 1: Demonstrates Commitment to Integrity and Ethical Values', 'The entity demonstrates a commitment to integrity and ethical values.', 'manual'),
('f1000000-0000-0000-0000-000000000001', 'CC1.2', 'Security', 'CC1: Control Environment', 'COSO Principle 3: Establishes Structure, Authority, and Responsibility', 'Management establishes structures, reporting lines, and appropriate authorities and responsibilities.', 'manual'),
('f1000000-0000-0000-0000-000000000001', 'CC1.3', 'Security', 'CC1: Control Environment', 'COSO Principle 4: Demonstrates Commitment to Competence', 'The entity demonstrates a commitment to attract, develop, and retain competent individuals.', 'manual'),
('f1000000-0000-0000-0000-000000000001', 'CC1.4', 'Security', 'CC1: Control Environment', 'COSO Principle 5: Enforces Accountability', 'The entity holds individuals accountable for their internal control responsibilities.', 'manual'),
('f1000000-0000-0000-0000-000000000001', 'CC1.5', 'Security', 'CC1: Control Environment', 'COSO Principle 2: Exercises Oversight Responsibility', 'The board of directors demonstrates independence from management and exercises oversight.', 'manual'),
-- CC2: Communication and Information
('f1000000-0000-0000-0000-000000000001', 'CC2.1', 'Security', 'CC2: Communication & Information', 'COSO Principle 13: Uses Relevant Information', 'The entity obtains or generates and uses relevant, quality information to support the functioning of internal control.', 'manual'),
('f1000000-0000-0000-0000-000000000001', 'CC2.2', 'Security', 'CC2: Communication & Information', 'COSO Principle 14: Communicates Internally', 'The entity internally communicates information necessary to support the functioning of internal control.', 'manual'),
('f1000000-0000-0000-0000-000000000001', 'CC2.3', 'Security', 'CC2: Communication & Information', 'COSO Principle 15: Communicates Externally', 'The entity communicates with external parties regarding matters affecting the functioning of internal control.', 'manual'),
-- CC3: Risk Assessment
('f1000000-0000-0000-0000-000000000001', 'CC3.1', 'Security', 'CC3: Risk Assessment', 'COSO Principle 6: Specifies Suitable Objectives', 'The entity specifies objectives with sufficient clarity to enable the identification and assessment of risks.', 'manual'),
('f1000000-0000-0000-0000-000000000001', 'CC3.2', 'Security', 'CC3: Risk Assessment', 'COSO Principle 7: Identifies and Analyzes Risk', 'The entity identifies risks to the achievement of its objectives across the entity and analyzes risks.', 'manual'),
('f1000000-0000-0000-0000-000000000001', 'CC3.3', 'Security', 'CC3: Risk Assessment', 'COSO Principle 8: Assesses Fraud Risk', 'The entity considers the potential for fraud in assessing risks to the achievement of objectives.', 'manual'),
('f1000000-0000-0000-0000-000000000001', 'CC3.4', 'Security', 'CC3: Risk Assessment', 'COSO Principle 9: Identifies and Analyzes Significant Change', 'The entity identifies and assesses changes that could significantly impact the system of internal control.', 'manual'),
-- CC4: Monitoring Activities
('f1000000-0000-0000-0000-000000000001', 'CC4.1', 'Security', 'CC4: Monitoring Activities', 'COSO Principle 16: Conducts Ongoing Evaluations', 'The entity selects, develops, and performs ongoing evaluations to ascertain whether components are present and functioning.', 'automated'),
('f1000000-0000-0000-0000-000000000001', 'CC4.2', 'Security', 'CC4: Monitoring Activities', 'COSO Principle 17: Evaluates and Communicates Deficiencies', 'The entity evaluates and communicates internal control deficiencies in a timely manner.', 'manual'),
-- CC5: Control Activities
('f1000000-0000-0000-0000-000000000001', 'CC5.1', 'Security', 'CC5: Control Activities', 'COSO Principle 10: Selects and Develops Control Activities', 'The entity selects and develops control activities that contribute to the mitigation of risks.', 'manual'),
('f1000000-0000-0000-0000-000000000001', 'CC5.2', 'Security', 'CC5: Control Activities', 'COSO Principle 11: Selects and Develops General Controls Over Technology', 'The entity selects and develops general control activities over technology.', 'automated'),
('f1000000-0000-0000-0000-000000000001', 'CC5.3', 'Security', 'CC5: Control Activities', 'COSO Principle 12: Deploys Through Policies and Procedures', 'The entity deploys control activities through policies and procedures.', 'manual'),
-- CC6: Logical and Physical Access
('f1000000-0000-0000-0000-000000000001', 'CC6.1', 'Security', 'CC6: Logical & Physical Access', 'Logical Access Security Measures', 'The entity implements logical access security software, infrastructure, and architectures over protected information assets.', 'automated'),
('f1000000-0000-0000-0000-000000000001', 'CC6.2', 'Security', 'CC6: Logical & Physical Access', 'New Access Registration and Authorization', 'Prior to issuing system credentials and granting system access, the entity registers and authorizes new internal and external users.', 'manual'),
('f1000000-0000-0000-0000-000000000001', 'CC6.3', 'Security', 'CC6: Logical & Physical Access', 'Access Removal and Review', 'The entity removes access to protected information assets when appropriate.', 'manual'),
('f1000000-0000-0000-0000-000000000001', 'CC6.4', 'Security', 'CC6: Logical & Physical Access', 'Physical Access Restrictions', 'The entity restricts physical access to facilities and protected information assets.', 'manual'),
('f1000000-0000-0000-0000-000000000001', 'CC6.5', 'Security', 'CC6: Logical & Physical Access', 'Logical and Physical Protections Against Malware', 'The entity discontinues logical and physical protections over physical assets only after the ability to read or recover data has been diminished.', 'automated'),
('f1000000-0000-0000-0000-000000000001', 'CC6.6', 'Security', 'CC6: Logical & Physical Access', 'External Threats', 'The entity implements controls to prevent or detect and act upon the introduction of unauthorized or malicious software.', 'automated'),
('f1000000-0000-0000-0000-000000000001', 'CC6.7', 'Security', 'CC6: Logical & Physical Access', 'Transmission of Data', 'The entity restricts the transmission, movement, and removal of information to authorized internal and external users.', 'automated'),
('f1000000-0000-0000-0000-000000000001', 'CC6.8', 'Security', 'CC6: Logical & Physical Access', 'Unauthorized or Malicious Software', 'The entity implements controls to prevent or detect and act upon the introduction of unauthorized or malicious software.', 'automated'),
-- CC7: System Operations
('f1000000-0000-0000-0000-000000000001', 'CC7.1', 'Security', 'CC7: System Operations', 'Detection of Vulnerabilities', 'To meet its objectives, the entity uses detection and monitoring procedures to identify changes to configurations that introduce new vulnerabilities.', 'automated'),
('f1000000-0000-0000-0000-000000000001', 'CC7.2', 'Security', 'CC7: System Operations', 'Monitoring of System Components', 'The entity monitors system components and the operation of those components for anomalies.', 'automated'),
('f1000000-0000-0000-0000-000000000001', 'CC7.3', 'Security', 'CC7: System Operations', 'Evaluation of Security Events', 'The entity evaluates security events to determine whether they could or have resulted in a failure of the entity to meet its objectives.', 'manual'),
('f1000000-0000-0000-0000-000000000001', 'CC7.4', 'Security', 'CC7: System Operations', 'Incident Response', 'The entity responds to identified security incidents by executing a defined incident response program.', 'manual'),
('f1000000-0000-0000-0000-000000000001', 'CC7.5', 'Security', 'CC7: System Operations', 'Remediation of Identified Vulnerabilities', 'The entity identifies, develops, and implements remediation activities to remediate identified vulnerabilities.', 'manual'),
-- CC8: Change Management
('f1000000-0000-0000-0000-000000000001', 'CC8.1', 'Security', 'CC8: Change Management', 'Change Management Process', 'The entity authorizes, designs, develops or acquires, configures, documents, tests, approves, and implements changes to infrastructure, data, software, and procedures.', 'automated'),
-- CC9: Risk Mitigation
('f1000000-0000-0000-0000-000000000001', 'CC9.1', 'Security', 'CC9: Risk Mitigation', 'Identification of Risk', 'The entity identifies and assesses risks associated with achieving its service commitments and system requirements.', 'manual'),
('f1000000-0000-0000-0000-000000000001', 'CC9.2', 'Security', 'CC9: Risk Mitigation', 'Vendor Risk Management', 'The entity assesses and manages risks associated with vendors and business partners.', 'manual'),
-- A1: Availability
('f1000000-0000-0000-0000-000000000001', 'A1.1', 'Availability', 'A1: Availability', 'Capacity Management', 'The entity maintains, monitors, and evaluates current processing capacity and use of system components to manage capacity demand.', 'automated'),
('f1000000-0000-0000-0000-000000000001', 'A1.2', 'Availability', 'A1: Availability', 'Recovery Plan', 'The entity authorizes, designs, develops or acquires, implements, operates, approves, maintains, and monitors environmental protections, software, data backup processes, and recovery infrastructure.', 'manual'),
('f1000000-0000-0000-0000-000000000001', 'A1.3', 'Availability', 'A1: Availability', 'Backup and Recovery Testing', 'The entity tests recovery plan procedures supporting system recovery to meet its objectives.', 'manual'),
-- C1: Confidentiality
('f1000000-0000-0000-0000-000000000001', 'C1.1', 'Confidentiality', 'C1: Confidentiality', 'Identification of Confidential Information', 'The entity identifies and maintains confidential information to meet the entity''s objectives related to confidentiality.', 'manual'),
('f1000000-0000-0000-0000-000000000001', 'C1.2', 'Confidentiality', 'C1: Confidentiality', 'Disposal of Confidential Information', 'The entity disposes of confidential information to meet the entity''s objectives related to confidentiality.', 'manual'),
-- PI1: Processing Integrity
('f1000000-0000-0000-0000-000000000001', 'PI1.1', 'Processing Integrity', 'PI1: Processing Integrity', 'Completeness and Accuracy', 'The entity obtains or generates, uses, and communicates relevant, quality information to support the functioning of internal control.', 'automated'),
('f1000000-0000-0000-0000-000000000001', 'PI1.2', 'Processing Integrity', 'PI1: Processing Integrity', 'System Processing', 'The entity''s system processing is complete, accurate, timely, and authorized.', 'automated'),
-- P Privacy (sample)
('f1000000-0000-0000-0000-000000000001', 'P1.1', 'Privacy', 'P1: Privacy Notice', 'Privacy Notice', 'The entity provides notice to data subjects about its privacy practices.', 'manual'),
('f1000000-0000-0000-0000-000000000001', 'P2.1', 'Privacy', 'P2: Choice and Consent', 'User Consent', 'The entity communicates choices available regarding the collection, use, retention, disclosure, and disposal of personal information.', 'manual'),
('f1000000-0000-0000-0000-000000000001', 'P3.1', 'Privacy', 'P3: Collection', 'Collection of Personal Information', 'Personal information is collected consistent with the entity''s objectives related to privacy.', 'manual'),
('f1000000-0000-0000-0000-000000000001', 'P4.1', 'Privacy', 'P4: Use, Retention & Disposal', 'Use of Personal Information', 'The entity limits the use of personal information to the purposes identified in the privacy notice.', 'manual'),
('f1000000-0000-0000-0000-000000000001', 'P5.1', 'Privacy', 'P5: Access', 'Access to Personal Information', 'The entity grants individuals the ability to access their stored personal information.', 'manual'),
('f1000000-0000-0000-0000-000000000001', 'P6.1', 'Privacy', 'P6: Disclosure & Notification', 'Disclosure to Third Parties', 'The entity discloses personal information to third parties with the individual''s consent.', 'manual'),
('f1000000-0000-0000-0000-000000000001', 'P7.1', 'Privacy', 'P7: Quality', 'Accuracy of Personal Information', 'The entity collects and maintains accurate, up-to-date, complete, and relevant personal information.', 'manual'),
('f1000000-0000-0000-0000-000000000001', 'P8.1', 'Privacy', 'P8: Monitoring & Enforcement', 'Privacy Compliance Monitoring', 'The entity monitors compliance with its privacy commitments and objectives.', 'manual');

-- Update controls_count
UPDATE frameworks SET controls_count = (SELECT COUNT(*) FROM controls WHERE framework_id = 'f1000000-0000-0000-0000-000000000001') WHERE id = 'f1000000-0000-0000-0000-000000000001';

-- ============================================================
-- ISO 27001:2022 (Key Controls Sample)
-- ============================================================
INSERT INTO frameworks (id, name, version, description, controls_count) VALUES
    ('f2000000-0000-0000-0000-000000000002', 'ISO 27001', '2022', 'Information security management system (ISMS) standard by ISO/IEC.', 93);

INSERT INTO controls (framework_id, control_id, domain, category, title, description, type) VALUES
('f2000000-0000-0000-0000-000000000002', 'A.5.1', 'Organizational', 'A.5: Organizational Controls', 'Policies for information security', 'Information security policy and topic-specific policies shall be defined, approved by management, published, communicated, and reviewed.', 'manual'),
('f2000000-0000-0000-0000-000000000002', 'A.5.2', 'Organizational', 'A.5: Organizational Controls', 'Information security roles and responsibilities', 'Information security roles and responsibilities shall be defined and allocated.', 'manual'),
('f2000000-0000-0000-0000-000000000002', 'A.5.3', 'Organizational', 'A.5: Organizational Controls', 'Segregation of duties', 'Conflicting duties and conflicting areas of responsibility shall be segregated.', 'manual'),
('f2000000-0000-0000-0000-000000000002', 'A.5.4', 'Organizational', 'A.5: Organizational Controls', 'Management responsibilities', 'Management shall require all personnel to apply information security in accordance with the established policy.', 'manual'),
('f2000000-0000-0000-0000-000000000002', 'A.5.5', 'Organizational', 'A.5: Organizational Controls', 'Contact with authorities', 'Appropriate contacts with relevant authorities shall be established and maintained.', 'manual'),
('f2000000-0000-0000-0000-000000000002', 'A.5.14', 'Organizational', 'A.5: Organizational Controls', 'Information transfer', 'Information transfer rules, procedures, or agreements shall be in place.', 'manual'),
('f2000000-0000-0000-0000-000000000002', 'A.5.15', 'Organizational', 'A.5: Organizational Controls', 'Access control', 'Rules to control physical and logical access to information and other associated assets shall be established.', 'automated'),
('f2000000-0000-0000-0000-000000000002', 'A.5.16', 'Organizational', 'A.5: Organizational Controls', 'Identity management', 'The full life cycle of identities shall be managed.', 'automated'),
('f2000000-0000-0000-0000-000000000002', 'A.5.17', 'Organizational', 'A.5: Organizational Controls', 'Authentication information', 'Allocation and management of authentication information shall be controlled by a management process.', 'automated'),
('f2000000-0000-0000-0000-000000000002', 'A.5.18', 'Organizational', 'A.5: Organizational Controls', 'Access rights', 'Access rights to information and other associated assets shall be provisioned, reviewed, modified and removed.', 'manual'),
('f2000000-0000-0000-0000-000000000002', 'A.5.19', 'Organizational', 'A.5: Organizational Controls', 'Information security in supplier relationships', 'Processes and procedures shall be defined and implemented to manage the information security risks associated with the use of supplier products or services.', 'manual'),
('f2000000-0000-0000-0000-000000000002', 'A.5.20', 'Organizational', 'A.5: Organizational Controls', 'Addressing security within supplier agreements', 'Relevant information security requirements shall be established and agreed with each supplier.', 'manual'),
('f2000000-0000-0000-0000-000000000002', 'A.5.23', 'Organizational', 'A.5: Organizational Controls', 'Information security for use of cloud services', 'Processes for acquisition, use, management and exit from cloud services shall be established.', 'manual'),
('f2000000-0000-0000-0000-000000000002', 'A.6.1', 'People', 'A.6: People Controls', 'Screening', 'Background verification checks on all candidates for employment shall be carried out prior to joining.', 'manual'),
('f2000000-0000-0000-0000-000000000002', 'A.6.3', 'People', 'A.6: People Controls', 'Information security awareness, education and training', 'Personnel and relevant interested parties shall receive appropriate awareness education and training.', 'manual'),
('f2000000-0000-0000-0000-000000000002', 'A.6.4', 'People', 'A.6: People Controls', 'Disciplinary process', 'A disciplinary process shall be formalized and communicated to take actions against personnel who have committed an information security policy violation.', 'manual'),
('f2000000-0000-0000-0000-000000000002', 'A.6.8', 'People', 'A.6: People Controls', 'Information security event reporting', 'The organization shall provide a mechanism for personnel to report observed or suspected information security events.', 'manual'),
('f2000000-0000-0000-0000-000000000002', 'A.7.1', 'Physical', 'A.7: Physical Controls', 'Physical security perimeters', 'Security perimeters shall be defined and used to protect areas that contain information and other associated assets.', 'manual'),
('f2000000-0000-0000-0000-000000000002', 'A.7.2', 'Physical', 'A.7: Physical Controls', 'Physical entry', 'Secure areas shall be protected by appropriate entry controls and access points.', 'manual'),
('f2000000-0000-0000-0000-000000000002', 'A.7.4', 'Physical', 'A.7: Physical Controls', 'Physical security monitoring', 'Premises shall be continuously monitored for unauthorized physical access.', 'automated'),
('f2000000-0000-0000-0000-000000000002', 'A.8.1', 'Technological', 'A.8: Technological Controls', 'User endpoint devices', 'Information stored on, processed by or accessible via user endpoint devices shall be protected.', 'automated'),
('f2000000-0000-0000-0000-000000000002', 'A.8.2', 'Technological', 'A.8: Technological Controls', 'Privileged access rights', 'The allocation and use of privileged access rights shall be restricted and managed.', 'automated'),
('f2000000-0000-0000-0000-000000000002', 'A.8.3', 'Technological', 'A.8: Technological Controls', 'Information access restriction', 'Access to information and other associated assets shall be restricted in accordance with the established access control policy.', 'automated'),
('f2000000-0000-0000-0000-000000000002', 'A.8.4', 'Technological', 'A.8: Technological Controls', 'Access to source code', 'Read and write access to source code, development tools and software libraries shall be appropriately managed.', 'automated'),
('f2000000-0000-0000-0000-000000000002', 'A.8.5', 'Technological', 'A.8: Technological Controls', 'Secure authentication', 'Secure authentication technologies and procedures shall be implemented based on information access restrictions.', 'automated'),
('f2000000-0000-0000-0000-000000000002', 'A.8.6', 'Technological', 'A.8: Technological Controls', 'Capacity management', 'The use of resources shall be monitored and adjusted in line with current and expected capacity requirements.', 'automated'),
('f2000000-0000-0000-0000-000000000002', 'A.8.7', 'Technological', 'A.8: Technological Controls', 'Protection against malware', 'Protection against malware shall be implemented and supported by appropriate user awareness.', 'automated'),
('f2000000-0000-0000-0000-000000000002', 'A.8.8', 'Technological', 'A.8: Technological Controls', 'Management of technical vulnerabilities', 'Information about technical vulnerabilities of information systems in use shall be obtained.', 'automated'),
('f2000000-0000-0000-0000-000000000002', 'A.8.9', 'Technological', 'A.8: Technological Controls', 'Configuration management', 'Configurations, including security configurations, of hardware, software, services and networks shall be established, documented, implemented, monitored and reviewed.', 'automated'),
('f2000000-0000-0000-0000-000000000002', 'A.8.12', 'Technological', 'A.8: Technological Controls', 'Data leakage prevention', 'Data leakage prevention measures shall be applied to systems, networks and any other devices that process, store or transmit sensitive information.', 'automated'),
('f2000000-0000-0000-0000-000000000002', 'A.8.15', 'Technological', 'A.8: Technological Controls', 'Logging', 'Logs that record activities, exceptions, faults and other relevant events shall be produced, stored, protected and analysed.', 'automated'),
('f2000000-0000-0000-0000-000000000002', 'A.8.16', 'Technological', 'A.8: Technological Controls', 'Monitoring activities', 'Networks, systems and applications shall be monitored for anomalous behaviour and appropriate actions taken to evaluate potential information security incidents.', 'automated'),
('f2000000-0000-0000-0000-000000000002', 'A.8.23', 'Technological', 'A.8: Technological Controls', 'Web filtering', 'Access to external websites shall be managed to reduce exposure to malicious content.', 'automated'),
('f2000000-0000-0000-0000-000000000002', 'A.8.24', 'Technological', 'A.8: Technological Controls', 'Use of cryptography', 'Rules for the effective use of cryptography, including cryptographic key management, shall be defined and implemented.', 'manual'),
('f2000000-0000-0000-0000-000000000002', 'A.8.25', 'Technological', 'A.8: Technological Controls', 'Secure development life cycle', 'Rules for the secure development of software and systems shall be established and applied.', 'manual'),
('f2000000-0000-0000-0000-000000000002', 'A.8.28', 'Technological', 'A.8: Technological Controls', 'Secure coding', 'Secure coding principles shall be applied to software development.', 'manual'),
('f2000000-0000-0000-0000-000000000002', 'A.8.29', 'Technological', 'A.8: Technological Controls', 'Security testing in development and acceptance', 'Security testing processes shall be defined and implemented in the development life cycle.', 'manual'),
('f2000000-0000-0000-0000-000000000002', 'A.8.31', 'Technological', 'A.8: Technological Controls', 'Separation of development, test and production environments', 'Development, testing and production environments shall be separated and secured.', 'manual'),
('f2000000-0000-0000-0000-000000000002', 'A.8.32', 'Technological', 'A.8: Technological Controls', 'Change management', 'Changes to information processing facilities and information systems shall be subject to change management procedures.', 'manual'),
('f2000000-0000-0000-0000-000000000002', 'A.8.33', 'Technological', 'A.8: Technological Controls', 'Test information', 'Test information shall be appropriately selected, protected and managed.', 'manual'),
('f2000000-0000-0000-0000-000000000002', 'A.8.34', 'Technological', 'A.8: Technological Controls', 'Protection of information systems during audit testing', 'Audit tests and other assurance activities involving assessment of operational systems shall be planned and agreed between the tester and appropriate management.', 'manual');

UPDATE frameworks SET controls_count = (SELECT COUNT(*) FROM controls WHERE framework_id = 'f2000000-0000-0000-0000-000000000002') WHERE id = 'f2000000-0000-0000-0000-000000000002';

-- ============================================================
-- NIST CSF 2.0
-- ============================================================
INSERT INTO frameworks (id, name, version, description, controls_count) VALUES
    ('f3000000-0000-0000-0000-000000000003', 'NIST CSF', '2.0', 'NIST Cybersecurity Framework 2.0 — Govern, Identify, Protect, Detect, Respond, Recover.', 106);

INSERT INTO controls (framework_id, control_id, domain, category, title, description, type) VALUES
-- GV: Govern
('f3000000-0000-0000-0000-000000000003', 'GV.OC-01', 'Govern', 'GV.OC: Organizational Context', 'Mission and Stakeholder Expectations', 'The organizational mission is understood and informs cybersecurity risk management decisions.', 'manual'),
('f3000000-0000-0000-0000-000000000003', 'GV.OC-02', 'Govern', 'GV.OC: Organizational Context', 'Legal and Regulatory Requirements', 'Internal and external stakeholders are understood, and their needs and expectations regarding cybersecurity risk management are understood.', 'manual'),
('f3000000-0000-0000-0000-000000000003', 'GV.RM-01', 'Govern', 'GV.RM: Risk Management Strategy', 'Risk Appetite', 'Risk management objectives are established and agreed to by organizational stakeholders.', 'manual'),
('f3000000-0000-0000-0000-000000000003', 'GV.RM-02', 'Govern', 'GV.RM: Risk Management Strategy', 'Risk Tolerance', 'Risk appetite and risk tolerance statements are established, communicated, and maintained.', 'manual'),
('f3000000-0000-0000-0000-000000000003', 'GV.PO-01', 'Govern', 'GV.PO: Policy', 'Policy Creation', 'Policy for managing cybersecurity risks is established based on organizational context, cybersecurity strategy, and priorities.', 'manual'),
('f3000000-0000-0000-0000-000000000003', 'GV.PO-02', 'Govern', 'GV.PO: Policy', 'Policy Enforcement', 'Policy for managing cybersecurity risks is reviewed, updated, communicated, and enforced by organizational leadership.', 'manual'),
-- ID: Identify
('f3000000-0000-0000-0000-000000000003', 'ID.AM-01', 'Identify', 'ID.AM: Asset Management', 'Inventory of Assets', 'Inventories of hardware managed by the organization are maintained.', 'automated'),
('f3000000-0000-0000-0000-000000000003', 'ID.AM-02', 'Identify', 'ID.AM: Asset Management', 'Software Inventory', 'Inventories of software, services, and systems managed by the organization are maintained.', 'automated'),
('f3000000-0000-0000-0000-000000000003', 'ID.AM-03', 'Identify', 'ID.AM: Asset Management', 'Network Representation', 'Representations of the organization''s authorized network communication and internal and external network data flows are maintained.', 'automated'),
('f3000000-0000-0000-0000-000000000003', 'ID.AM-04', 'Identify', 'ID.AM: Asset Management', 'External Systems', 'Inventories of services provided by suppliers are maintained.', 'manual'),
('f3000000-0000-0000-0000-000000000003', 'ID.AM-07', 'Identify', 'ID.AM: Asset Management', 'Data Classification', 'Inventories of data and corresponding metadata for designated data types are maintained.', 'manual'),
('f3000000-0000-0000-0000-000000000003', 'ID.RA-01', 'Identify', 'ID.RA: Risk Assessment', 'Vulnerability Identification', 'Vulnerabilities in assets are identified, validated, and recorded.', 'automated'),
('f3000000-0000-0000-0000-000000000003', 'ID.RA-02', 'Identify', 'ID.RA: Risk Assessment', 'Cyber Threat Intelligence', 'Cyber threat intelligence is received from information sharing forums and sources.', 'manual'),
('f3000000-0000-0000-0000-000000000003', 'ID.RA-03', 'Identify', 'ID.RA: Risk Assessment', 'Threat Identification', 'Internal and external threats to the organization are identified and recorded.', 'manual'),
('f3000000-0000-0000-0000-000000000003', 'ID.RA-04', 'Identify', 'ID.RA: Risk Assessment', 'Risk Determination', 'Potential impacts and likelihoods of threats exploiting vulnerabilities are identified and recorded.', 'manual'),
('f3000000-0000-0000-0000-000000000003', 'ID.RA-05', 'Identify', 'ID.RA: Risk Assessment', 'Risk Prioritization', 'Threats, vulnerabilities, likelihoods, and impacts are used to understand inherent risk and inform risk response prioritization.', 'manual'),
-- PR: Protect
('f3000000-0000-0000-0000-000000000003', 'PR.AA-01', 'Protect', 'PR.AA: Identity Management', 'Identity Management', 'Identities and credentials for authorized users, services, and hardware are managed by the organization.', 'automated'),
('f3000000-0000-0000-0000-000000000003', 'PR.AA-02', 'Protect', 'PR.AA: Identity Management', 'Identity Proofing', 'Identities are proofed and bound to credentials based on the context of interactions.', 'manual'),
('f3000000-0000-0000-0000-000000000003', 'PR.AA-03', 'Protect', 'PR.AA: Identity Management', 'Authentication', 'Users, services, and hardware are authenticated.', 'automated'),
('f3000000-0000-0000-0000-000000000003', 'PR.AA-05', 'Protect', 'PR.AA: Identity Management', 'Access Permissions', 'Access permissions, entitlements, and authorizations are defined in a policy, managed, enforced, and reviewed.', 'automated'),
('f3000000-0000-0000-0000-000000000003', 'PR.AA-06', 'Protect', 'PR.AA: Identity Management', 'Physical Access', 'Physical access to assets is managed, monitored, and enforced commensurate with risk.', 'manual'),
('f3000000-0000-0000-0000-000000000003', 'PR.AT-01', 'Protect', 'PR.AT: Awareness and Training', 'Awareness Training', 'Personnel are provided with awareness and training so that they possess the knowledge and skills to perform general tasks with cybersecurity risks in mind.', 'manual'),
('f3000000-0000-0000-0000-000000000003', 'PR.DS-01', 'Protect', 'PR.DS: Data Security', 'Data at Rest', 'The confidentiality, integrity, and availability of data-at-rest are protected.', 'automated'),
('f3000000-0000-0000-0000-000000000003', 'PR.DS-02', 'Protect', 'PR.DS: Data Security', 'Data in Transit', 'The confidentiality, integrity, and availability of data-in-transit are protected.', 'automated'),
('f3000000-0000-0000-0000-000000000003', 'PR.DS-10', 'Protect', 'PR.DS: Data Security', 'Data in Use', 'The confidentiality, integrity, and availability of data-in-use are protected.', 'automated'),
('f3000000-0000-0000-0000-000000000003', 'PR.PS-01', 'Protect', 'PR.PS: Platform Security', 'Configuration Management', 'Configuration management practices are established and applied.', 'automated'),
('f3000000-0000-0000-0000-000000000003', 'PR.PS-02', 'Protect', 'PR.PS: Platform Security', 'Software Maintenance', 'Software is maintained, replaced, and removed commensurate with risk.', 'automated'),
('f3000000-0000-0000-0000-000000000003', 'PR.PS-04', 'Protect', 'PR.PS: Platform Security', 'Log Generation', 'Logs of cybersecurity events are generated and made available for continuous monitoring.', 'automated'),
('f3000000-0000-0000-0000-000000000003', 'PR.IR-01', 'Protect', 'PR.IR: Technology Infrastructure Resilience', 'Network Integrity', 'Networks and environments are protected from unauthorized logical access and usage.', 'automated'),
-- DE: Detect
('f3000000-0000-0000-0000-000000000003', 'DE.CM-01', 'Detect', 'DE.CM: Continuous Monitoring', 'Monitoring Networks', 'Networks and network services are monitored to find potentially adverse events.', 'automated'),
('f3000000-0000-0000-0000-000000000003', 'DE.CM-02', 'Detect', 'DE.CM: Continuous Monitoring', 'Monitoring Physical Environment', 'The physical environment is monitored to find potentially adverse events.', 'manual'),
('f3000000-0000-0000-0000-000000000003', 'DE.CM-03', 'Detect', 'DE.CM: Continuous Monitoring', 'Monitoring Personnel Activity', 'Personnel activity and technology usage are monitored to find potentially adverse events.', 'automated'),
('f3000000-0000-0000-0000-000000000003', 'DE.CM-06', 'Detect', 'DE.CM: Continuous Monitoring', 'Monitoring External Service Providers', 'External service provider activities and services are monitored to find potentially adverse events.', 'manual'),
('f3000000-0000-0000-0000-000000000003', 'DE.AE-02', 'Detect', 'DE.AE: Adverse Event Analysis', 'Event Analysis', 'Potentially adverse events are analyzed to better understand associated activities.', 'manual'),
('f3000000-0000-0000-0000-000000000003', 'DE.AE-03', 'Detect', 'DE.AE: Adverse Event Analysis', 'Information Correlation', 'Information is correlated from multiple sources.', 'automated'),
('f3000000-0000-0000-0000-000000000003', 'DE.AE-06', 'Detect', 'DE.AE: Adverse Event Analysis', 'Incident Declaration', 'A plan is in place to communicate suspected cybersecurity incidents and vulnerabilities to designated internal and external stakeholders.', 'manual'),
-- RS: Respond
('f3000000-0000-0000-0000-000000000003', 'RS.MA-01', 'Respond', 'RS.MA: Incident Management', 'Incident Execution', 'The incident response plan is executed in coordination with relevant third parties once an incident is declared.', 'manual'),
('f3000000-0000-0000-0000-000000000003', 'RS.MA-02', 'Respond', 'RS.MA: Incident Management', 'Incident Reports', 'Incidents are reported to designated internal and external stakeholders in a timely manner.', 'manual'),
('f3000000-0000-0000-0000-000000000003', 'RS.AN-03', 'Respond', 'RS.AN: Incident Analysis', 'Forensic Analysis', 'Analysis is performed to establish what has taken place during an incident and the root cause of the incident.', 'manual'),
('f3000000-0000-0000-0000-000000000003', 'RS.CO-02', 'Respond', 'RS.CO: Incident Response Reporting', 'Reporting to Authorities', 'Internal and external stakeholders are notified of incidents.', 'manual'),
-- RC: Recover
('f3000000-0000-0000-0000-000000000003', 'RC.RP-01', 'Recover', 'RC.RP: Incident Recovery Plan Execution', 'Recovery Plan', 'The recovery portion of the incident response plan is executed once initiated from the incident response process.', 'manual'),
('f3000000-0000-0000-0000-000000000003', 'RC.CO-03', 'Recover', 'RC.CO: Incident Recovery Communication', 'Reputation Repair', 'Recovery activities and progress in restoring operational capabilities are communicated to designated internal and external stakeholders.', 'manual');

UPDATE frameworks SET controls_count = (SELECT COUNT(*) FROM controls WHERE framework_id = 'f3000000-0000-0000-0000-000000000003') WHERE id = 'f3000000-0000-0000-0000-000000000003';
