TO RUN THS FILE you need to create the data using the information provided in in the data.js and schema.sql
It will run in local host 3000
- packages need install
    mysql-await
    sesssion 
    bycript
    pug 
    

USER Support 
You need to create an account first by click on sign up then you need to login again (My intend was to redirect to the mainpage but I could'nt figure out )
I did use bycript to hash the password 

MAIN PAGE 

- Users can filter their task using the filter button based on the pending, complete , overdue or all their tasks

ADVANCE FEATURE 

" Deadlines
All todo items have a deadline
You can sort all todo list items by their deadline
You can view a list containing only overdue todo list items that are not marked done."

- Users can have option to include the DATE or NOT (if DATE is NUll in will be at the button when sorted)
- The sort button will sort the date of the task and unsort it back to the original listing 
- The log history on the side will log the activies such as DELETE, ADD, MODIFY, COMPLETE, however it will reset since I don't 
    store any of the information in the database
