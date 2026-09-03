## From the tester:
<p>
  Always happy to find the bug and report it.
  <br>
  <img src="../frontend/src/assests/image.png" alt="Fixer" width="100">
</p>

### When setting up the HRMS system
1. There is a <i>small</i> 🪲 when migrating files from the folder migrations, you might get the issue on  \backend\migrations\20260818101722-add-citizenship-number-to-employees.js, you just need to do 
 ```bash 
 ALTER TABLE employees
DROP COLUMN citizenship_number;
``` 
in the database, and then again re-run the migration command, don't forget that the  folder seeders, need to migrate it too.

2. just for reminder, this project just works for node / nvm version 20 and above only.

3. when setting the db, just follow the .env.example, and create .env file and copy all the data from the .env.example and add your own db properties.

4. just follow the HRMS\README.md
