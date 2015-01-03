//simple-todos.js

Tasks = new Mongo.Collection("tasks");

if (Meteor.isClient) {

    Template.body.helpers({
        tasks: function(){
            if (Session.get("hideCompleted")) {
                //filter out completed tasks
                return Tasks.find({checked: {$ne: true}}, {sort: {createdAt: -1}});
            }else{
                //return all the tasks
                return Tasks.find({}, {sort: {createdAt: -1}});
            }
        },

        hideCompleted: function(){
            return Session.get("hideCompleted");
        },

        incompleteCount: function(){
            return Tasks.find({checked: {$ne: true}}).count();
        },

        completeCount: function(){
            return Tasks.find({checked: {$ne: false}}).count()
        }

    });

    Template.body.events({
        "submit .new-task": function(event){
            //This function is called when the new task form is submitted

            Tasks.insert({
                text: event.target.text.value,
                createdAt: new Date()
            });

            //clear the form
            event.target.text.value = "";

            //prevent default form submit
            return false;
        },

        "change .hide-completed input": function(event){
           Session.set("hideCompleted", event.target.checked);
        }

    });

    Template.task.events({
        "click .toggle-checked": function(){
            //console.log(this);
            Tasks.update(this._id, {$set: {checked: !this.checked}});
        },
        "click .delete": function(){
            Tasks.remove(this._id);
        }
    });

}
