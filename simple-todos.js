//simple-todos.js

Tasks = new Mongo.Collection("tasks");

if (Meteor.isClient) {

    Template.body.helpers({
        tasks: function(){
            return Tasks.find({});
        }
    });

    Template.body.events({
        "submit .new-task": function(event){
            //This function is called when the new task form is submitted
            var text = event.target.text.value;
            Tasks.insert({
                text: text,
                createdAt: new Date()
            });

            //clear the form
            event.target.text.value = "";

            //prevent default form submit
            return false;
        }
    })

}
