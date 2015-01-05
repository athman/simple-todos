//simple-todos.js

Tasks = new Mongo.Collection("tasks");

if (Meteor.isClient) {

    Meteor.subscribe("tasks");

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

    Template.task.helpers({
        isOwner: function(){
            return this.owner === Meteor.userId();
        }
    });

    Template.body.events({
        "submit .new-task": function(event){
            //This function is called when the new task form is submitted

            var text = event.target.text.value;

            Meteor.call("addTask", text);

            //console.log(Meteor.user());

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
            Meteor.call("setChecked", this._id, !this.checked);
        },

        "click .delete": function(){
            Meteor.call("deleteTask", this._id);
        },

        "click .toggle-private": function(){
            Meteor.call("setPrivate", this._id, !this.private);
        }

    });

    Accounts.ui.config({
        passwordSignupFields: "USERNAME_ONLY"
    });
}

Meteor.methods({
    addTask: function(text){
        //Make sure the user is logged in before posting
        if (! Meteor.userId()) {
            throw new Meteor.Error("Please Sign In");
        }

        Tasks.insert({
            text: text,
            createdAt: new Date(),
            owner: Meteor.userId(),
            username: Meteor.user().username
        });
    },

    deleteTask: function(taskId){
        if (! Meteor.userId()) {
            throw new Meteor.Error("Please Sign In");
        }

        var task = Tasks.findOne(taskId);
        if (task.private && task.owner !== Meteor.userId()) {
            //Only the owner can delete the task
            throw new Meteor.Error("You're not the owner of this task");
        }

        Tasks.remove(taskId);
    },

    setChecked: function(taskId, setChecked){
        if (! Meteor.userId()) {
            throw new Meteor.Error("Please Sign In");
        }

        var task = Tasks.findOne(taskId);
        if (task.private && task.owner !== Meteor.userId()) {
            throw new Meteor.Error("You're not the owner of this task");
        }

        Tasks.update(taskId, {$set: { checked: setChecked} });
    },

    setPrivate: function(taskId, setToPrivate){
        var task = Tasks.findOne(taskId);

        //make sure only the task owner can make a task private
        if (task.owner !== Meteor.userId()) {
            throw new Meteor.Error("You're not the owner of this task");
        }

        Tasks.update(taskId, {$set: {private: setToPrivate}});
    }

});

if (Meteor.isServer) {
    Meteor.publish("tasks", function(){
        return Tasks.find({
            $or: [
                {private: {$ne: true}},
                {owner: this.userId}
            ]
        });
    });
}









