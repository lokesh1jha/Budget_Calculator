// BUDGET CONTROLLER
var budgetController = (function() {
    // function constructor - first letter capital
    // all objects created through them will inherit these methods

    var Expense = function(id, description,value) {
        this.id = id;
        this.description = description;
        this.value = value;
        this.percentage = -1;
    };

    Expense.prototype.calcPercentage = function(totalIncome) {
        if(totalIncome > 0) {
            this.percentage = Math.round((this.value/totalIncome) *100);
        } else {
            this.percentage = -1;
        }
    };

    Expense.prototype.getPercentage = function() {
        return this.percentage;
    };

    var Income = function(id, description,value) {
        this.id = id;
        this.description = description;
        this.value = value;
    };

    var calculateTotal = function(type) {
        var sum = 0;
        data.allItems[type].forEach((current) => {
            sum += current.value;
        });
        data.totals[type] = sum;
    };
    
    // data structure for storing data 
    var data = {
        allItems : {
            exp: [],
            inc: []
        },
        totals : {
            exp: 0,
            inc: 0
        },
        budget: 0,
        percentage: -1
    }

    return {
        addItem: function(type, des, val) {
            var neweItem, ID;

            // ID = (ID of the last element) +1
            // Create new id
            if(data.allItems[type].length > 0) {
                ID = (data.allItems[type][data.allItems[type].length - 1].id) + 1;
            } else {
                ID = 0;
            }

            // Create new item
            if(type === 'exp') {
                neweItem = new Expense(ID,des,val);
            } else {
                neweItem = new Income(ID,des,val);
            }

            // Push it into our data structure
            data.allItems[type].push(neweItem);

            // Return new element
            return neweItem;
        },

        deleteItem: function(type, id) {
            var ids, index;

            // returns the array of id's
            ids = data.allItems[type].map((current) => current.id);
            /* same as
                ids = data.allItems[type].map(function(current) {
                    return current.id;
                });
            */

            index = ids.indexOf(id);
            // not found = -1
            if(index !== -1) {
                // splice(index , number of elements to be deleted) - used to delete an element
                data.allItems[type].splice(index, 1);
            }
        },

        calculateBudget: function() {
            // calculate total income and expenses
            calculateTotal('exp');
            calculateTotal('inc');

            // calculate the budget: income - expenses
            data.budget = data.totals.inc - data.totals.exp;

            // calculate the percentage of income that we spent
            if(data.totals.inc > 0) {
                data.percentage = Math.round((data.totals.exp / data.totals.inc) * 100);
            } else {
                data.percentage = -1;
            }
            
        },

        calculatePercentages: function() {
            data.allItems.exp.forEach(function(current) {
                current.calcPercentage(data.totals.inc);
            }); 
        },

        getPercentages: function() {
            var allPerc = data.allItems.exp.map((current) => current.getPercentage());
            return allPerc;
        },

        // Note: You must wrap the returning object literal into parentheses. 
        // Otherwise curly braces will be considered to denote the function’s body. 
        getBudget: () => ({
            budget: data.budget,
            totalInc: data.totals.inc,
            totalExp: data.totals.exp,
            percentage: data.percentage
        }),
        /* same as:
            getBudget: function() {
                budget: data.budget,
                totalInc: data.totals.inc,
                totalExp: data.totals.exp,
                percentage: data.percentage
            }
        */
        displayData: function() {
            console.log(data);
        }
    }

})();

// UI CONTROLLER
var UIController = (function() {

    var DOMstrings = {
        inputType: '.add__type',
        inputDescription: '.add__description',
        inputValue: '.add__value',
        inputBtn: '.add__btn',
        incomeContainer: '.income__list',
        expensesContainer: '.expenses__list',
        budgetLabel: '.budget__value',
        incomeLabel: '.budget__income--value',
        expensesLabel: '.budget__expenses--value',
        percentageLabel: '.budget__expenses--percentage',
        container: '.container',
        expensesPercLabel: '.item__percentage',
        dateLabel: '.budget__title--month'
    };
    
    var formatNumber = function(num, type) {
        var num, numSplit, integer,len, decimal;
        /*
        + or - before number
        2 decimal pts
        comma separating the thousands
        */

        num = Math.abs(num);
        num = num.toFixed(2); // rounds it to 2 decimal places

        // comma separting strings
        numSplit = num.split('.'); // divides into 2 parts

        integer = numSplit[0];
        len = integer.length;
        if(len > 3) {
            integer = integer.substr(0,len-3)+ ','+ integer.substr(len-3, 3);
        }

        decimal = numSplit[1];

        return (type === 'exp' ? '-' : '+') + ' ' + integer +'.'+ decimal;
    };

    var nodeListForEach = function(list,callback) {
        for(var i=0;i< list.length;i++) {
            callback(list[i], i);
        }
    };

    return {
        getInput: function () {
            return{
                type : document.querySelector(DOMstrings.inputType).value, // Will be either 'inc' or 'exp'
                description : document.querySelector(DOMstrings.inputDescription).value,
                value : parseFloat(document.querySelector(DOMstrings.inputValue).value)
            };
        },

        addListItem: function(obj, type) {
            var html, newHtml,element;
            // Create HTML string with placeholder text
            if(type === 'inc') {
                element = DOMstrings.incomeContainer; 
                html = '<div class="item clearfix" id="inc-%id%"> <div class="item__description">%description%</div> <div class="right clearfix"> <div class="item__value">%value%</div> <div class="item__delete"> <button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button> </div> </div> </div>';
            } else {
                element = DOMstrings.expensesContainer; 
                html = '<div class="item clearfix" id="exp-%id%"> <div class="item__description">%description%</div> <div class="right clearfix"> <div class="item__value">%value%</div> <div class="item__percentage">21%</div> <div class="item__delete"> <button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button> </div> </div> </div>';
            }

            // Replace placeholder text with actual data
            newHtml = html.replace('%id%', obj.id);
            newHtml = newHtml.replace('%description%', obj.description);
            newHtml = newHtml.replace('%value%', formatNumber(obj.value,type));

            // Insert HTML into DOM
            document.querySelector(element).insertAdjacentHTML('beforeend', newHtml);
        },

        deleteListItem: function(selectorID) {
            var ele = document.getElementById(selectorID);
            ele.parentNode.removeChild(ele);
        },

        clearFields: function() {
            var fields, fieldsArr;

            // Returns a list
            fields = document.querySelectorAll(DOMstrings.inputDescription + ', ' + DOMstrings.inputValue);
            // converting the list into an array
            fieldsArr = Array.prototype.slice.call(fields);

            // new type of for loop
            fieldsArr.forEach((current,index,array) => {
                current.value = '';
            });
            /* same as:
                fieldsArr.forEach(function(current,index,array) {
                    current.value = "";
                });
            */

            // set focus back to 1st element
            fieldsArr[0].focus();
        },

        displayBudget: function(obj) {
            
            document.querySelector(DOMstrings.budgetLabel).textContent = formatNumber(obj.budget,(obj.budget>=0?'inc':'exp'));
            document.querySelector(DOMstrings.incomeLabel).textContent = formatNumber(obj.totalInc,'inc');
            document.querySelector(DOMstrings.expensesLabel).textContent = formatNumber(obj.totalExp,'exp');
            
            if(obj.percentage>0) {
                document.querySelector(DOMstrings.percentageLabel).textContent = obj.percentage +'%';
            } else {
                document.querySelector(DOMstrings.percentageLabel).textContent = '-';
            }
        },

        displayPercentages:function(percentages) {
            // returns a node list
            var fields = document.querySelectorAll(DOMstrings.expensesPercLabel);
            
            nodeListForEach(fields, function(current, index) {
                if(percentages[index] > 0) {
                    current.textContent = percentages[index] + '%';
                } else {
                    current.textContent = '-';
                }
            });

        },

        displayYear: function() {
            var now,year,month;
            now = new Date();
            console.log(now);
            year = now.getFullYear();
            document.querySelector(DOMstrings.dateLabel).textContent = year;
        },

        changedType: function() {

            var fields = document.querySelectorAll(
                DOMstrings.inputType + ',' +
                DOMstrings.inputDescription + ',' +
                DOMstrings.inputValue);

            nodeListForEach(fields, function(current) {
                current.classList.toggle('red-focus');
            });

            document.querySelector(DOMstrings.inputBtn).classList.toggle('red');
        },

        getDOMstrings: () => DOMstrings
        /* Same as 
            getDOMstrings: function() {
                return DOMstrings;
            }
        */
    };

})();


// GLOBAL APP CONTROLLER
var controller = (function(budgetCtrl, UICtrl) {

    var setupEventListeners = function() {
        var DOM = UIController.getDOMstrings();

        // dont add () to ctrlAddItem - as eventListener will automatically call it
        document.querySelector(DOM.inputBtn).addEventListener('click', ctrlAddItem);

        // keypress - any key is pressed; e- event variable
        document.addEventListener('keypress', function(e) {
            // which - for older browsers
            // keycode => 13 is for enter key
            if(e.keyCode === 13 || e.which === 13) {
                ctrlAddItem();
            }
        });

        document.querySelector(DOM.container).addEventListener('click', ctrlDeleteItem);

        document.querySelector(DOM.inputType).addEventListener('change', UICtrl.changedType);
    };

    var updateBudget = function() {
        // 1. Calculate the budget
        budgetCtrl.calculateBudget();

        // 2. Returns the budget
        var budget = budgetCtrl.getBudget();

        // 3. Display the budget on the UI
        UIController.displayBudget(budget);
    };

    var updatePercentages = function() {
        // 1. Calculate the percentage
        budgetController.calculatePercentages();

        // 2. Read from budget controller
        var percentages = budgetCtrl.getPercentages();

        // 3. Update the UI with new percentages
        UIController.displayPercentages(percentages);

    }

    var ctrlAddItem = function() {
        var input, newItem;
        
        // 1. Get field input data
        input = UIController.getInput();

        if(input.description != "" && !isNaN(input.value) && input.value > 0) {
            // 2. Add item to the budget controller
            newItem = budgetCtrl.addItem(input.type,input.description,input.value);
    
            // 3. Add item to the UI
            UIController.addListItem(newItem,input.type);
    
            // 4. Clear the fields
            UIController.clearFields();
    
            // 5. Calculate and update budget
            updateBudget();

            // 6. Calculate and update percentages
            updatePercentages();
        }
        
    };
    
    var ctrlDeleteItem = function(event) {
        var itemID, splitID,type,ID ;
        // retrieve the ID of the block to be deleted
        itemID = event.target.parentNode.parentNode.parentNode.parentNode.id;
        // other blocks donot have an ID
        // therefore, if ID is not NULL, delete item
        if(itemID) {
            // format: inc-1
            // '-' is the split character
            splitID = itemID.split('-');
            type = splitID[0];
            ID = parseInt(splitID[1]);
            
            // 1. Delete item from data structure
            budgetController.deleteItem(type, ID);
            
            // 2. Delete item from UI
            UIController.deleteListItem(itemID);
            
            // 3. Update and show the new budget
            updateBudget();
            
            // 4. Calculate and update percentages
            updatePercentages();
        }
    };
    
    return {
        init: function() {
            console.log('Application has started!');
            UICtrl.displayYear();
            UIController.displayBudget({
                budget: 0,
                totalInc: 0,
                totalExp: 0,
                percentage: -1
            });
            setupEventListeners();
        }
    }; 

})(budgetController, UIController);

// without this line of code nothing will happen as there will be no event listeners
controller.init();
