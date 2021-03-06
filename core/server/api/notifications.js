// # Notifications API
// RESTful API for creating notifications
var when               = require('when'),
    _                  = require('lodash'),
    errors             = require('../errors'),
    utils              = require('./utils'),

    // Holds the persistent notifications
    notificationsStore = [],
    // Holds the last used id
    notificationCounter = 0,
    notifications;

/**
 * ## Notification API Methods
 *
 * **See:** [API Methods](index.js.html#api%20methods)
 */
notifications = {

    /**
     * ### Browse
     * Fetch all notifications
     * @returns {Promise(Notifications)}
     */
    browse: function browse() {
        return when({ 'notifications': notificationsStore });
    },

    /**
     * ### Destroy
     * Remove a specific notification
     *
     * @param {{id (required), context}} options
     * @returns {Promise(Notifications)}
     */
    destroy: function destroy(options) {
        var notification = _.find(notificationsStore, function (element) {
            return element.id === parseInt(options.id, 10);
        });

        if (notification && !notification.dismissible) {
            return when.reject(
                new errors.NoPermissionError('You do not have permission to dismiss this notification.')
            );
        }

        if (!notification) {
            return when.reject(new errors.NotFoundError('Notification does not exist.'));
        }

        notificationsStore = _.reject(notificationsStore, function (element) {
            return element.id === parseInt(options.id, 10);
        });
        return when({notifications: [notification]});
    },

    /**
     * ### DestroyAll
     * Clear all notifications, used for tests
     *
     * @private Not exposed over HTTP
     * @returns {Promise}
     */
    destroyAll: function destroyAll() {
        notificationsStore = [];
        notificationCounter = 0;
        return when(notificationsStore);
    },

    /**
     * ### Add
     *
     *
     * **takes:** a notification object of the form
     * ```
     *  msg = { notifications: [{
     *      type: 'error', // this can be 'error', 'success', 'warn' and 'info'
     *      message: 'This is an error', // A string. Should fit in one line.
     *      location: 'bottom', // A string where this notification should appear. can be 'bottom' or 'top'
     *      dismissible: true // A Boolean. Whether the notification is dismissible or not.
     *  }] };
     * ```
     */
    add: function add(object) {

        var defaults = {
                dismissible: true,
                location: 'bottom',
                status: 'persistent'
            },
            addedNotifications = [];


        return utils.checkObject(object, 'notifications').then(function (checkedNotificationData) {
            _.each(checkedNotificationData.notifications, function (notification) {
                notificationCounter = notificationCounter + 1;

                notification = _.assign(defaults, notification, {
                    id: notificationCounter
                    //status: 'persistent'
                });

                notificationsStore.push(notification);
                addedNotifications.push(notification);
            });

            return when({ notifications: addedNotifications});
        });
    }
};

module.exports = notifications;
