// BUDGET CONTROLLER
var budgetController = (function() {
   
     var Expense = function(id, description, value) {
        this.id= id;
        this.description = description;
        this.value = value;
        this.percentage = -1;
     };
     Expense.prototype.calculatePercentages = function(totalIncome) {
       
        if (totalIncome > 0) {
        this.percentage = Math.round((this.value / totalIncome) *100 );
        
     }else{
         this.percentage = -1;
         
     }
    };

    Expense.prototype.getPercentage = function() {
            return this.percentage;
    };

    var Income = function(id, description, value) {
        this.id= id;
        this.description = description;
        this.value = value;
    };

    calculateTotal = function(type) {
        var sum = 0;
        data.allItems[type].forEach(function(cur) {
            sum += cur.value;
        });
        data.total[type] = sum;
    };

    //Data Structure that stores newItems
    var data = {
        allItems: {
            exp: [], 
            inc: []
        },
        total:{
            exp: 0,
            inc: 0
        },
        budget: 0,
        percentage : -1
    };

    return {
        addItem: function(type, des, val) {
            var newItem, ID;

            //Create new ID -- the last element ID is accesed
            if(data.allItems[type].length>0){
            ID = (data.allItems[type][data.allItems[type].length - 1].id) + 1;
        }
        else {
                ID = 0;
            }
            //Create new item based on 'inc' or 'exp' type
            if (type === 'exp') {
                newItem = new Expense(ID, des, val);
            }else if(type === 'inc') {
                newItem = new Income(ID, des, val);
            }

            //Push it into our data structure
            data.allItems[type].push(newItem);
           
            //Return the new element
            return newItem;
        },

        deletItem : function(type, id) {
        var ids,index;
            //id = 3
            //data.allItems[type][id]; not work as id is not continous after deleting any 
            // to find index of id from the array

            ids = data.allItems[type].map(function(current) {
                // map returns a new array
                return current.id;
            });
            //ids = [1,2,3,5,9,11]

            index = ids.indexOf(id);

            //Delete this item
            if(index !== -1) {
                data.allItems[type].splice(index, 1);
            }
        },

        calculateBudget(){

            // calculate total income and expenses
                calculateTotal('exp');
                calculateTotal('inc');
            //calculate the budget : income - expenses
                data.budget = data.total.inc - data.total.exp;
            //calculate the percentage of income that we spent
            if (data.total.inc > 0) {    
            data.percentage = Math.round((data.total.exp / data.total.inc) * 100);
            } else{
            data.percentage = -1; // percentage not available
            }
        },

        calculatePercentages: function() {

            data.allItems.exp.forEach(function(cur){
                cur.calculatePercentages(data.total.inc);
               });
        },

        getPercentage: function(){

            var allPerc = data.allItems.exp.map(function(cur) {
                return cur.getPercentage();
                });
            return allPerc;

        },

        getBudget : function () {
         return {
             budget: data.budget,
             totalInc : data.total.inc,
             totalExp : data.total.exp,
             percentage: data.percentage
         }   
        },

        testing:function(){
            console.log(data);
        }
    }

})();

//UI CONTROLLER
var UIController = (function() {
    var DOMstring ={
        inputType : '.add__type',
        inputDiscription : '.add__description',
        inputValue: '.add__value',
        inputBtn: '.add__btn',
        incomeContainer: '.income__list',
        expensesContainer: '.expenses__list',
        budgetLabel: '.budget__value',
        incomeLabel: '.budget__income--value',
        expenseLabel: '.budget__expenses--value',
        percentageLabel: '.budget__expenses--percentage',
        container: '.container',
        expensesPercLabel: '.item__percentage',
        dateLabel: '.budget__title--month'
    };
    
   return {
       getInput: function(){
           return{
               
            //Get input from User
        type : document.querySelector(DOMstring.inputType).value, // will be either inc or exp.
        description : document.querySelector(DOMstring.inputDiscription).value,
        value :parseFloat(document.querySelector(DOMstring.inputValue).value)
       };
    },
    addListItem : function(obj, type){
        var html, newHtml, element;
        //Create HTML string with placeholder text
        if (type == 'inc'){
            element = DOMstring.incomeContainer;

             html = '<div class="item clearfix" id="inc-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>'
        }
        else if (type == 'exp'){
            element = DOMstring.expensesContainer;

            html = '<div class="item clearfix" id="exp-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__percentage">%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>'
        }
        //Replace the placeholder text with some actual data
        newHtml = html.replace('%id%', obj.id);
        newHtml = newHtml.replace('%description%', obj.description);
        newHtml = newHtml.replace('%value%', formatNumber(obj.value, type));
        
        //Insert the HTML into the DOM
        document.querySelector(element).insertAdjacentHTML('beforeend', newHtml);

    },

    deleteListItems: function(selectorid) {

        var el = document.getElementById(selectorid);
        el.parentNode.removeChild(el);

    },

    clearFields: function() {
        var fields, fieldsArr;
      fields =  document.querySelectorAll(DOMstring.inputDiscription + ',' + DOMstring.inputValue);
    
      fieldsArr = Array.prototype.slice.call(fields);
    
      fieldsArr.forEach(function(current, index, array){
        current.value = "";
      });
      fieldsArr[0].focus();
    },

    displayBudget: function(obj) {
        obj.budget < 0 ? type = 'inc' : type = 'exp' ;
        document.querySelector(DOMstring.budgetLabel).textContent = formatNumber(obj.budget, type);
        document.querySelector(DOMstring.incomeLabel).textContent = formatNumber(obj.totalInc, 'inc');
        document.querySelector(DOMstring.expenseLabel).textContent = formatNumber(obj.totalExp, 'exp');
        document.querySelector(DOMstring.percentageLabel).textContent = obj.percentage;

        if (obj.percentage > 0) {
            document.querySelectorAll(DOMstring.percentageLabel).textContent = obj.percentage + '%';
        } else{
        document.querySelectorAll(DOMstring.percentageLabel).textContent = '...';
        }
    },

    displayPercentages:function(percentage) {

        var fields = document.querySelectorAll(DOMstring.expensesPercLabel);
       
       var nodeListForEach= function(list,callback) {
           // Custom the nodeListForEach
           for (var i = 0; i < list.length; i++){
               callback(list[i], i);
           }
       };

        nodeListForEach(fields, function(current, index){
            console.log(percentage[index]);
            if(percentage[index] > 0)
            current.textContent = percentage[index] + '%';
            else 
            current.textContent = '...';

        });

    },

    displayMonth: function() {
        var now, month, year;
       
       now = new Date();
        //var christmas = new Date (2016, 11, 25);
        month = now.getMonth();
        year = now.getFullYear();
        months = ['Jan', 'Feb', 'March', 'April', 'May', 'June', 'July', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
        document.querySelector(DOMstring.dateLabel).textContent = months[month] + ' ' + year;

    },

    getDOMstring: function() {
        return DOMstring;
    }
   };
})();


var formatNumber = function(num, type) {
    var numSplit;
    /*
    + or - before number exactly 2 decimal points 
    comma separating the thousands

    2310.4567 -> +2,310.46
    2000 -> +2,000.00
    */
      num = Math.abs(num); //overwriting
      num = num.toFixed(2); // two digit after decimal
        // now num is string

        numSplit = num.split('.');

        int = numSplit[0];
        if(int.length > 3){
            int = int.substr(0,int.length - 3) + ',' + int.substr(int.length - 3,3);
        }
        dec = numSplit[1];

        // type === 'exp' ? sign = '-' :sign = '+';
        return (type === 'exp' ? '-' : '+') + ' ' + int + '.' + dec;
};


var updateBudget = function() {
    // 1. Cal budget
    budgetController.calculateBudget();
    //2. return budget
     var budget = budgetController.getBudget();
    //3. Display budget at UI
    UIController.displayBudget(budget);
};

var updatePercentages= function() {

    // 1. Calculate percentage
    budgetController.calculatePercentages();
   
    // 2. Read percentage from the budget controller
    var percentage =  budgetController.getPercentage();
    
    // 3. Update the UI with the new percentages
    UIController.displayPercentages(percentage);
}

//GLOBAL APP CONTROLLER
var controller = (function( budgetCtrl, UICtrl) {
        
    var setupEventListners = function() {
    var DOM = UICtrl.getDOMstring();
        

        document.querySelector(DOM.inputBtn).addEventListener('click', ctlrAddItem);      
  
        document.querySelector(DOM.inputValue).addEventListener('keypress', function(event) {
          if (event.keyCode === 13 || event.which === 13){
              ctlrAddItem();
          }
        });
        document.querySelector(DOM.container).addEventListener('click', CtrlDeleteItem);

    };

       
        var ctlrAddItem = function() {
            var input, newItem;

            // 1. input data
            var input = UICtrl.getInput();
            
            if(input.description !== "" && !isNaN(input.value) && input.value > 0) {
            // 2. Add item to bdget controller
            newItem = budgetCtrl.addItem(input.type, input.description, input.value);

            // 3. add the item to UI
            UICtrl.addListItem(newItem, input.type);
           
            // 4. Clear fields
            UICtrl.clearFields();

            // 5. Cal and update budget
            updateBudget();

            // 6. Calculae and Update percentages
            updatePercentages();
        }
        };

        var CtrlDeleteItem = function(event) {
            var itemID, type, ID, splitID;
            itemID  = event.target.parentNode.parentNode.parentNode.parentNode.id;
            if (itemID) {
                //inc-1 
                splitID = itemID.split('-');
                type = splitID[0];
                ID = parseInt(splitID[1]);
                
                // 1. delet the item from data stucture
                budgetCtrl.deletItem(type, ID);
                // 2. Delete the item from UI
                UICtrl.deleteListItems(itemID);
                // 3. Updateand showthe new budget
                   updateBudget();

            }
        };
    return {
        init: function() {
            console.log('Application has started.');
            
            setupEventListners();
            UICtrl.displayMonth();
            UICtrl.displayBudget({
                budget: 0,
                totalInc: 0,
                totalExp: 0,
                percentage: -1
            });
            
        }
    };
    
})(budgetController, UIController);


controller.init();
