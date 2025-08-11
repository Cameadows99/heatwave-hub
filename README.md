# Necessary updates

## A Profile Page that contains:

### Easy access for current week daily and total hours (starting count at monday 5 a.m. Ending Saturday midnight)

### Current requested days off (display dates)

## Context for role (i.e. employee, manager, admin)?

## Admin Ability to click user and see daily hours with total weekly hours added up (for pay)

### No pay involved in app. Only daily hours (in decimal) and weekly hours.

## Suggestion box

### Details in /components/suggestions

## Finish OrderList

### /components/orderRequests

###

- A discussion board general + all departments
  a. Construction
  b. Liners
  c. vermiculite
  ?d. possibly service and stores combined (lets leave this out until i decide to put them together or keep separate but set it up to be easily implemented)

have a render switch. one for discussions with everything i previously metioned. another for "Order Requests." This will have:

- A list of all the orders requeste
- A "Request" Button that opens a request modal

The modal:

- automatically attaches profile name to the request.
- an "item" text input
- an "add item" that creates another text input
- date is filled out automatically
- optional "additional details" + optional "reason"
- "send request" button

The list should be well formatted in display sorted by date. The items should be able to be deleted.
There should be an "ordered" state that shows the item has been ordered and after three days the item requested gets deleted. The user should be able to visually know their item has been ordered.
