-- ============================================================
-- SecComply: ISO 9001:2015 (Quality Management System)
-- ============================================================
-- Seeds ISO 9001 as a clause-based framework. Unlike the security
-- frameworks, the auditable unit is the "shall" inside Clauses 4-10,
-- so controls.control_id = clause number and controls.domain = the
-- Clause-4..10 group (drives the clause-by-clause roll-up in
-- /control-requirements). category = the sub-clause grouping.
--
-- Idempotent: safe to re-run (ON CONFLICT DO NOTHING). The
-- controls_count is kept in sync by trg_recount_controls (migration
-- 008); the explicit UPDATE at the end is belt-and-suspenders.
-- ============================================================

INSERT INTO frameworks (id, name, version, description, slug, category, icon_name, color, controls_count)
VALUES (
    'f5000000-0000-0000-0000-000000000005',
    'ISO 9001',
    '2015',
    'Quality management system (QMS) standard by ISO. Requirements-based and process-based: the auditable unit is the "shall" statement inside Clauses 4-10, satisfied through the organization''s processes.',
    'iso-9001',
    'quality',
    'BadgeCheck',
    '#0ea5e9',
    40
)
ON CONFLICT (id) DO NOTHING;

INSERT INTO controls (framework_id, control_id, domain, category, title, description, type, sort_order) VALUES
-- 4. Context of the Organization
('f5000000-0000-0000-0000-000000000005', '4.1', '4. Context of the Organization', '4. Context of the Organization', 'Understanding the organization and its context', 'The organization shall determine external and internal issues relevant to its purpose and strategic direction that affect its ability to achieve the intended results of its QMS.', 'manual', 1),
('f5000000-0000-0000-0000-000000000005', '4.2', '4. Context of the Organization', '4. Context of the Organization', 'Needs and expectations of interested parties', 'The organization shall determine the interested parties relevant to the QMS and their requirements, and monitor and review information about them.', 'manual', 2),
('f5000000-0000-0000-0000-000000000005', '4.3', '4. Context of the Organization', '4. Context of the Organization', 'Determining the scope of the QMS', 'The organization shall determine the boundaries and applicability of the QMS to establish its scope, documenting any requirement determined to be not applicable (e.g. Design & Development).', 'manual', 3),
('f5000000-0000-0000-0000-000000000005', '4.4', '4. Context of the Organization', '4. Context of the Organization', 'Quality management system and its processes', 'The organization shall establish, implement, maintain and continually improve the QMS, including the processes needed and their interactions (inputs, outputs, sequence, owners, KPIs).', 'manual', 4),

-- 5. Leadership
('f5000000-0000-0000-0000-000000000005', '5.1', '5. Leadership', '5.1 Leadership and commitment', 'Leadership and commitment', 'Top management shall demonstrate leadership and commitment with respect to the QMS by taking accountability for its effectiveness and ensuring resources are available.', 'manual', 5),
('f5000000-0000-0000-0000-000000000005', '5.1.2', '5. Leadership', '5.1 Leadership and commitment', 'Customer focus', 'Top management shall demonstrate leadership and commitment with respect to customer focus by ensuring customer and applicable regulatory requirements are determined and met.', 'manual', 6),
('f5000000-0000-0000-0000-000000000005', '5.2', '5. Leadership', '5.2 Policy', 'Quality policy', 'Top management shall establish, implement and maintain a quality policy appropriate to the organization, communicated and available as documented information.', 'manual', 7),
('f5000000-0000-0000-0000-000000000005', '5.3', '5. Leadership', '5.3 Roles, responsibilities and authorities', 'Organizational roles, responsibilities and authorities', 'Top management shall assign the responsibility and authority for relevant roles, including appointing a management representative for the QMS.', 'manual', 8),

-- 6. Planning
('f5000000-0000-0000-0000-000000000005', '6.1', '6. Planning', '6.1 Actions to address risks and opportunities', 'Actions to address risks and opportunities', 'The organization shall determine the risks and opportunities that need to be addressed to give assurance the QMS can achieve its intended results, and plan actions to address them.', 'manual', 9),
('f5000000-0000-0000-0000-000000000005', '6.2', '6. Planning', '6.2 Quality objectives and planning', 'Quality objectives and planning to achieve them', 'The organization shall establish measurable quality objectives at relevant functions and levels, and plan how to achieve them (what, resources, responsible, when, evaluation).', 'manual', 10),
('f5000000-0000-0000-0000-000000000005', '6.3', '6. Planning', '6.3 Planning of changes', 'Planning of changes', 'When the organization determines a need for changes to the QMS, the changes shall be carried out in a planned manner considering purpose, integrity, resources and responsibilities.', 'manual', 11),

-- 7. Support
('f5000000-0000-0000-0000-000000000005', '7.1.2', '7. Support', '7.1 Resources', 'People', 'The organization shall determine and provide the persons necessary for the effective implementation of the QMS and the operation and control of its processes.', 'manual', 12),
('f5000000-0000-0000-0000-000000000005', '7.1.3', '7. Support', '7.1 Resources', 'Infrastructure', 'The organization shall determine, provide and maintain the infrastructure (buildings, equipment, hardware, software) necessary for the operation of its processes.', 'manual', 13),
('f5000000-0000-0000-0000-000000000005', '7.1.4', '7. Support', '7.1 Resources', 'Environment for the operation of processes', 'The organization shall determine, provide and maintain the environment necessary for the operation of its processes (e.g. temperature, cleanliness).', 'manual', 14),
('f5000000-0000-0000-0000-000000000005', '7.1.5', '7. Support', '7.1 Resources', 'Monitoring and measuring resources', 'The organization shall determine and provide the resources needed for monitoring and measurement, ensuring they are calibrated/verified, suitable and maintained (calibration register).', 'manual', 15),
('f5000000-0000-0000-0000-000000000005', '7.1.6', '7. Support', '7.1 Resources', 'Organizational knowledge', 'The organization shall determine the knowledge necessary for the operation of its processes and to achieve conformity of products and services, and maintain it.', 'manual', 16),
('f5000000-0000-0000-0000-000000000005', '7.2', '7. Support', '7.2 Competence', 'Competence', 'The organization shall determine the necessary competence of persons doing work affecting QMS performance, and ensure they are competent on the basis of education, training or experience.', 'manual', 17),
('f5000000-0000-0000-0000-000000000005', '7.3', '7. Support', '7.3 Awareness', 'Awareness', 'The organization shall ensure that persons doing work under its control are aware of the quality policy, relevant objectives, their contribution and the implications of nonconformity.', 'manual', 18),
('f5000000-0000-0000-0000-000000000005', '7.4', '7. Support', '7.4 Communication', 'Communication', 'The organization shall determine the internal and external communications relevant to the QMS (what, when, with whom, how, who communicates).', 'manual', 19),
('f5000000-0000-0000-0000-000000000005', '7.5', '7. Support', '7.5 Documented information', 'Documented information', 'The QMS shall include documented information required by the standard and determined necessary; it shall be controlled (version, approval) and records retained.', 'manual', 20),

-- 8. Operation
('f5000000-0000-0000-0000-000000000005', '8.1', '8. Operation', '8.1 Operational planning and control', 'Operational planning and control', 'The organization shall plan, implement and control the processes needed to meet requirements, including acceptance criteria and the resources to achieve conformity.', 'manual', 21),
('f5000000-0000-0000-0000-000000000005', '8.2', '8. Operation', '8.2 Requirements for products and services', 'Requirements for products and services', 'The organization shall determine and review the requirements for products and services before committing to supply, including customer, statutory and regulatory requirements.', 'manual', 22),
('f5000000-0000-0000-0000-000000000005', '8.3', '8. Operation', '8.3 Design and development', 'Design and development of products and services', 'Where applicable, the organization shall establish a design and development process. Commonly excluded for manufacturers producing to published standards (document the exclusion in 4.3).', 'manual', 23),
('f5000000-0000-0000-0000-000000000005', '8.4', '8. Operation', '8.4 Externally provided processes, products and services', 'Control of externally provided processes, products and services', 'The organization shall ensure externally provided processes, products and services conform to requirements; evaluate, select, monitor and re-evaluate external providers (approved-supplier list).', 'manual', 24),
('f5000000-0000-0000-0000-000000000005', '8.5.1', '8. Operation', '8.5 Production and service provision', 'Control of production and service provision', 'The organization shall implement production and service provision under controlled conditions, including documented information, monitoring activities and competent persons (batch records).', 'manual', 25),
('f5000000-0000-0000-0000-000000000005', '8.5.2', '8. Operation', '8.5 Production and service provision', 'Identification and traceability', 'The organization shall use suitable means to identify outputs and shall control the unique identification of outputs where traceability is a requirement (batch/lot numbers).', 'manual', 26),
('f5000000-0000-0000-0000-000000000005', '8.5.3', '8. Operation', '8.5 Production and service provision', 'Property belonging to customers or external providers', 'The organization shall exercise care with property belonging to customers or external providers while it is under its control or being used.', 'manual', 27),
('f5000000-0000-0000-0000-000000000005', '8.5.4', '8. Operation', '8.5 Production and service provision', 'Preservation', 'The organization shall preserve the outputs during production and service provision to the extent necessary to ensure conformity (storage, handling, dispatch).', 'manual', 28),
('f5000000-0000-0000-0000-000000000005', '8.5.5', '8. Operation', '8.5 Production and service provision', 'Post-delivery activities', 'The organization shall meet requirements for post-delivery activities associated with the products and services (warranty, service obligations).', 'manual', 29),
('f5000000-0000-0000-0000-000000000005', '8.5.6', '8. Operation', '8.5 Production and service provision', 'Control of changes', 'The organization shall review and control changes for production or service provision to the extent necessary to ensure continuing conformity with requirements.', 'manual', 30),
('f5000000-0000-0000-0000-000000000005', '8.6', '8. Operation', '8.6 Release of products and services', 'Release of products and services', 'The organization shall implement planned arrangements to verify that requirements have been met before release, with documented information on the authorized release (final inspection).', 'manual', 31),
('f5000000-0000-0000-0000-000000000005', '8.7', '8. Operation', '8.7 Control of nonconforming outputs', 'Control of nonconforming outputs', 'The organization shall ensure outputs that do not conform are identified and controlled to prevent unintended use, taking appropriate action (correction, segregation, concession) and retaining records.', 'manual', 32),

-- 9. Performance Evaluation
('f5000000-0000-0000-0000-000000000005', '9.1.1', '9. Performance Evaluation', '9.1 Monitoring, measurement, analysis and evaluation', 'Monitoring, measurement, analysis and evaluation (general)', 'The organization shall determine what needs to be monitored and measured, the methods, and when results shall be analysed and evaluated.', 'manual', 33),
('f5000000-0000-0000-0000-000000000005', '9.1.2', '9. Performance Evaluation', '9.1 Monitoring, measurement, analysis and evaluation', 'Customer satisfaction', 'The organization shall monitor customers'' perceptions of the degree to which their needs and expectations have been fulfilled (complaints, feedback, surveys).', 'manual', 34),
('f5000000-0000-0000-0000-000000000005', '9.1.3', '9. Performance Evaluation', '9.1 Monitoring, measurement, analysis and evaluation', 'Analysis and evaluation', 'The organization shall analyse and evaluate appropriate data and information arising from monitoring and measurement to evaluate QMS performance and the need for improvement.', 'manual', 35),
('f5000000-0000-0000-0000-000000000005', '9.2', '9. Performance Evaluation', '9.2 Internal audit', 'Internal audit', 'The organization shall conduct internal audits at planned intervals to determine whether the QMS conforms to requirements and is effectively implemented and maintained.', 'manual', 36),
('f5000000-0000-0000-0000-000000000005', '9.3', '9. Performance Evaluation', '9.3 Management review', 'Management review', 'Top management shall review the QMS at planned intervals using prescribed inputs (KPIs, audit results, objectives, customer feedback) and record decisions and actions.', 'manual', 37),

-- 10. Improvement
('f5000000-0000-0000-0000-000000000005', '10.1', '10. Improvement', '10. Improvement', 'Improvement (general)', 'The organization shall determine and select opportunities for improvement and implement necessary actions to meet customer requirements and enhance satisfaction.', 'manual', 38),
('f5000000-0000-0000-0000-000000000005', '10.2', '10. Improvement', '10. Improvement', 'Nonconformity and corrective action', 'When a nonconformity occurs, the organization shall react to it, evaluate the need to eliminate its cause (root cause), implement corrective action and review effectiveness (CAPA loop).', 'manual', 39),
('f5000000-0000-0000-0000-000000000005', '10.3', '10. Improvement', '10. Improvement', 'Continual improvement', 'The organization shall continually improve the suitability, adequacy and effectiveness of the QMS, considering analysis, evaluation and management review outputs.', 'manual', 40)
ON CONFLICT (framework_id, control_id) DO NOTHING;

UPDATE frameworks
SET controls_count = (SELECT COUNT(*) FROM controls WHERE framework_id = 'f5000000-0000-0000-0000-000000000005')
WHERE id = 'f5000000-0000-0000-0000-000000000005';
