
## Your Role
You are an expert in javascript programming using the nextjs and react frameworks for reactive applications.  You
are to create an interactive survey delivery website.  Do not create survey administration or set-up functions in this
app. Those functions will be in a second application defined separately.

## Requirements
You are to create a complete nexjs project for delivering an interactive website for delivering surveys.  The visual should 
be light colored but not white. The survey should have a common home page that will be the root that has a
pleasant introduction to the site.  The intro should explain it is about surveys and includes both public and private
surveys. Styling should be modern, pleasant adn easily modified through well-managed styles

Name of the site is formlessandvoid.com

Top Navbar for all pages should include Home, Surveys and Contact as top navigation bar.  Home will always return
to the root document of the project.  Surveys will contain a variable list of the short survey name of all surveys
that are public and active.  Contact will contain a friendly contact-us type message with a link to an email address
as later@company.com

When a survey is selected from the list of surveys then the survey delivery page will be load with that survey.  Surveys
are identified by a GUID from a database table. The link on the Surveys NavBar drop down will show the short name as 
indicated above and use a link reference using the site root environment variable as the path to the survey.

The surveys should present a pleasant theme consistent with the whole of the site.  Each of the item-types should be 
supported.  These item-types are; text, yes-no, likert, multiple-choice, multiple-other.  Note that multiple-other 
is a multiple choice plus and other text option that when selected, a text field appears to allow the other option.  All 
questions can be required or optional and should have an indication as such. Progress through the survey should be
withheld if a required field is not completed.

All survey questions include a textual prompt and then the response structure for the associated item-type.  One
item should appear at a time on the screen with user selected back and next buttons.  Use a reasonable amount of
spacing for the prompt and response. Include as the last interaction on all surveys provide a page thanking the 
respondent for their participation. Allow the respondent to optionally provide an email address as an optional value 
that will be saved as a part of the survey responses, but will not be treated as a question for data processing 
purposes. All question pages and the final thank-you page should include a back and next (submit for the final page)
buttons.

For every item presented track the time the user spent viewing the item in seconds and how many times they 
visited it--in case they went back to it as a previous item. Record the time and visit-count with the item response.
Record the total time taken with the respondent information.

Create the pages, APIs, models, connections and configurations necessary to complete this application.

# General properties of the surveys
1. Can have zero to many questions
2. Can use any mix of item-types
3. Use a consistent and pleasant light (but not white style) for the site
4. Survey can be marked as active or inactive
5. Survey can optional have start and end date
6. Survey cannot be changed after at least one response is provided
7. Every time any respondent starts the survey it is a new survey
8. Record the IP address of the survey respondent
9. Record the start and submit time of the survey
10. Record an indicator if the survey was; started: respondent visited the landing page of the survey, in-progress:the respondent answered at least one question, completed: respondent completed the survey with the submit button

# Technical Implementation
- boostrap for the basic css
- react for components
- nextjs for the project structure and development framework
- sequelize for the O-R mapping tool
- postgresql for data storage

Consider other useful javascript and node packages to make the site meet these requirements.

Database
Consider the following tables and their columns
surveys - A table of the basic survey information, key by surveyid as a GUID.
surveyQuestions - A table of questions for each survey.  key by surveyquestionid as a GUID and sequence_number, assure a relationship to wurveys table.
respondents - A list of respondents who took the survey.  key respondentid as a GUID assure a relationship to surveys table.
responses - A record of the responses provided for each responseid as a GUID, with relationship to respondents table and the surveyQuestions table.

Consider additional columns as necessary to meet the requirements noted above

Create other tables as needed

# Finally
If other questions occur as you are working through this site build, stop and ask in the chat. I'm here for 
clarity as needed.
