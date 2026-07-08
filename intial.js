const employees = [
  { id: 1, name: 'Alice', role: 'Developer', salary: 70000 },
  { id: 2, name: 'Bob', role: 'Designer', salary: 65000 },
  { id: 3, name: 'Carla', role: 'Manager', salary: 85000 }
];

function getEmployeeById(id) {
  return employees.find(employee => employee.id === id);
}

function calculateTotalPayroll() {
  return employees.reduce((total, employee) => total + employee.salary, 0);
}

console.log('Employee list:');
employees.forEach(employee => {
  console.log(`- ${employee.name} (${employee.role}): $${employee.salary}`);
});

const employee = getEmployeeById(2);
console.log('\nEmployee found by ID 2:');
console.log(employee);

console.log(`\nTotal payroll: $${calculateTotalPayroll()}`);
