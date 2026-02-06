/**
 * HR Systems Integration Service - Workday Employee Management
 * Manages employee lifecycle and HR processes
 */

class HRSystemsIntegrationService {
    constructor() {
        this.connections = new Map();
        this.employees = new Map();
        this.departments = new Map();
        this.workflows = new Map();
        this.metrics = {
            totalEmployees: 0,
            activeEmployees: 0,
            onboardingInProgress: 0,
            avgOnboardingTime: 0
        };
    }

    // Workday Integration
    async connectWorkday(config) {
        const connection = {
            type: 'Workday',
            tenant: config.tenant,
            username: config.username,
            password: config.password,
            modules: ['HCM', 'Payroll', 'Benefits', 'Talent', 'Analytics'],
            status: 'connected'
        };
        
        this.connections.set('workday', connection);
        return { success: true, modules: connection.modules };
    }

    // BambooHR Integration
    async connectBambooHR(config) {
        const connection = {
            type: 'BambooHR',
            apiKey: config.apiKey,
            subdomain: config.subdomain,
            modules: ['employees', 'time_off', 'performance', 'reports'],
            status: 'connected'
        };
        
        this.connections.set('bamboohr', connection);
        return { success: true, modules: connection.modules };
    }

    // Employee Management
    async createEmployee(employeeData) {
        const employee = {
            id: `EMP-${Date.now()}`,
            employeeNumber: this.generateEmployeeNumber(),
            personalInfo: {
                firstName: employeeData.firstName,
                lastName: employeeData.lastName,
                email: employeeData.email,
                phone: employeeData.phone,
                address: employeeData.address
            },
            employment: {
                department: employeeData.department,
                position: employeeData.position,
                manager: employeeData.manager,
                startDate: employeeData.startDate,
                employmentType: employeeData.employmentType || 'full-time',
                salary: employeeData.salary,
                status: 'pending_onboarding'
            },
            onboarding: {
                status: 'not_started',
                completedTasks: [],
                startDate: null,
                completionDate: null
            },
            createdAt: new Date()
        };
        
        this.employees.set(employee.id, employee);
        this.metrics.totalEmployees++;
        
        return employee;
    }

    generateEmployeeNumber() {
        return `${new Date().getFullYear()}${String(this.metrics.totalEmployees + 1).padStart(4, '0')}`;
    }

    // Onboarding Automation
    async startOnboarding(employeeId) {
        const employee = this.employees.get(employeeId);
        if (!employee) throw new Error('Employee not found');
        
        const onboardingTasks = [
            'complete_paperwork',
            'setup_workstation',
            'it_account_creation',
            'benefits_enrollment',
            'security_training',
            'department_orientation',
            'manager_meeting',
            'buddy_assignment'
        ];
        
        employee.onboarding = {
            status: 'in_progress',
            tasks: onboardingTasks.map(task => ({
                id: task,
                name: this.getTaskName(task),
                status: 'pending',
                assignedTo: this.getTaskAssignee(task),
                dueDate: this.calculateDueDate(task)
            })),
            startDate: new Date(),
            completionDate: null
        };
        
        employee.employment.status = 'onboarding';
        this.metrics.onboardingInProgress++;
        
        return employee.onboarding;
    }

    getTaskName(taskId) {
        const taskNames = {
            'complete_paperwork': 'Complete Employment Paperwork',
            'setup_workstation': 'Setup Workstation',
            'it_account_creation': 'Create IT Accounts',
            'benefits_enrollment': 'Enroll in Benefits',
            'security_training': 'Complete Security Training',
            'department_orientation': 'Department Orientation',
            'manager_meeting': 'Meet with Manager',
            'buddy_assignment': 'Buddy System Assignment'
        };
        return taskNames[taskId] || taskId;
    }

    getTaskAssignee(taskId) {
        const assignees = {
            'complete_paperwork': 'HR',
            'setup_workstation': 'Facilities',
            'it_account_creation': 'IT',
            'benefits_enrollment': 'Benefits',
            'security_training': 'Security',
            'department_orientation': 'Department Head',
            'manager_meeting': 'Direct Manager',
            'buddy_assignment': 'HR'
        };
        return assignees[taskId] || 'HR';
    }

    calculateDueDate(taskId) {
        const daysFromStart = {
            'complete_paperwork': 1,
            'setup_workstation': 2,
            'it_account_creation': 1,
            'benefits_enrollment': 5,
            'security_training': 3,
            'department_orientation': 7,
            'manager_meeting': 2,
            'buddy_assignment': 1
        };
        
        const dueDate = new Date();
        dueDate.setDate(dueDate.getDate() + (daysFromStart[taskId] || 7));
        return dueDate;
    }

    async completeOnboardingTask(employeeId, taskId) {
        const employee = this.employees.get(employeeId);
        if (!employee) throw new Error('Employee not found');
        
        const task = employee.onboarding.tasks.find(t => t.id === taskId);
        if (!task) throw new Error('Task not found');
        
        task.status = 'completed';
        task.completedDate = new Date();
        
        // Check if all tasks completed
        const allCompleted = employee.onboarding.tasks.every(t => t.status === 'completed');
        if (allCompleted) {
            employee.onboarding.status = 'completed';
            employee.onboarding.completionDate = new Date();
            employee.employment.status = 'active';
            this.metrics.onboardingInProgress--;
            this.metrics.activeEmployees++;
        }
        
        return employee.onboarding;
    }

    // Performance Management
    async createPerformanceReview(employeeId, reviewData) {
        const employee = this.employees.get(employeeId);
        if (!employee) throw new Error('Employee not found');
        
        const review = {
            id: `REV-${Date.now()}`,
            employeeId,
            reviewPeriod: reviewData.period,
            reviewer: reviewData.reviewer,
            goals: reviewData.goals || [],
            ratings: {
                overall: reviewData.overallRating,
                categories: reviewData.categoryRatings || {}
            },
            feedback: reviewData.feedback,
            developmentPlan: reviewData.developmentPlan || [],
            status: 'draft',
            createdAt: new Date()
        };
        
        if (!employee.performance) employee.performance = [];
        employee.performance.push(review);
        
        return review;
    }

    // Time Off Management
    async requestTimeOff(employeeId, requestData) {
        const employee = this.employees.get(employeeId);
        if (!employee) throw new Error('Employee not found');
        
        const request = {
            id: `PTO-${Date.now()}`,
            employeeId,
            type: requestData.type, // vacation, sick, personal
            startDate: requestData.startDate,
            endDate: requestData.endDate,
            days: this.calculateBusinessDays(requestData.startDate, requestData.endDate),
            reason: requestData.reason,
            status: 'pending',
            submittedAt: new Date()
        };
        
        if (!employee.timeOff) employee.timeOff = [];
        employee.timeOff.push(request);
        
        return request;
    }

    calculateBusinessDays(startDate, endDate) {
        const start = new Date(startDate);
        const end = new Date(endDate);
        let days = 0;
        
        while (start <= end) {
            const dayOfWeek = start.getDay();
            if (dayOfWeek !== 0 && dayOfWeek !== 6) { // Not weekend
                days++;
            }
            start.setDate(start.getDate() + 1);
        }
        
        return days;
    }

    // Department Management
    async createDepartment(departmentData) {
        const department = {
            id: `DEPT-${Date.now()}`,
            name: departmentData.name,
            head: departmentData.head,
            budget: departmentData.budget,
            employees: [],
            createdAt: new Date()
        };
        
        this.departments.set(department.id, department);
        return department;
    }

    // HR Analytics
    async getHRAnalytics() {
        const employees = Array.from(this.employees.values());
        
        return {
            workforce: {
                total: this.metrics.totalEmployees,
                active: this.metrics.activeEmployees,
                onboarding: this.metrics.onboardingInProgress
            },
            demographics: {
                byDepartment: this.getEmployeesByDepartment(employees),
                byEmploymentType: this.getEmployeesByType(employees)
            },
            turnover: {
                rate: this.calculateTurnoverRate(employees),
                avgTenure: this.calculateAverageTenure(employees)
            },
            onboarding: {
                avgTime: this.calculateAverageOnboardingTime(employees),
                completionRate: this.calculateOnboardingCompletionRate(employees)
            }
        };
    }

    getEmployeesByDepartment(employees) {
        const byDept = {};
        employees.forEach(emp => {
            const dept = emp.employment.department;
            byDept[dept] = (byDept[dept] || 0) + 1;
        });
        return byDept;
    }

    getEmployeesByType(employees) {
        const byType = {};
        employees.forEach(emp => {
            const type = emp.employment.employmentType;
            byType[type] = (byType[type] || 0) + 1;
        });
        return byType;
    }

    calculateTurnoverRate(employees) {
        const terminated = employees.filter(emp => emp.employment.status === 'terminated').length;
        return this.metrics.totalEmployees > 0 ? (terminated / this.metrics.totalEmployees * 100).toFixed(2) + '%' : '0%';
    }

    calculateAverageTenure(employees) {
        const activeEmployees = employees.filter(emp => emp.employment.status === 'active');
        if (activeEmployees.length === 0) return 0;
        
        const totalTenure = activeEmployees.reduce((sum, emp) => {
            const startDate = new Date(emp.employment.startDate);
            const tenure = (Date.now() - startDate.getTime()) / (1000 * 60 * 60 * 24 * 365);
            return sum + tenure;
        }, 0);
        
        return (totalTenure / activeEmployees.length).toFixed(1) + ' years';
    }

    calculateAverageOnboardingTime(employees) {
        const completed = employees.filter(emp => 
            emp.onboarding && emp.onboarding.status === 'completed'
        );
        
        if (completed.length === 0) return 0;
        
        const totalTime = completed.reduce((sum, emp) => {
            const start = new Date(emp.onboarding.startDate);
            const end = new Date(emp.onboarding.completionDate);
            return sum + (end - start) / (1000 * 60 * 60 * 24);
        }, 0);
        
        return (totalTime / completed.length).toFixed(1) + ' days';
    }

    calculateOnboardingCompletionRate(employees) {
        const started = employees.filter(emp => 
            emp.onboarding && emp.onboarding.status !== 'not_started'
        ).length;
        
        const completed = employees.filter(emp => 
            emp.onboarding && emp.onboarding.status === 'completed'
        ).length;
        
        return started > 0 ? (completed / started * 100).toFixed(1) + '%' : '0%';
    }

    getMetrics() {
        return {
            ...this.metrics,
            departments: this.departments.size,
            connectedSystems: this.connections.size
        };
    }
}

module.exports = HRSystemsIntegrationService;