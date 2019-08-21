# jquery-waypoint
Simple jq plugin to execute a function whenever you scroll through a necessary page element

Usage
=====

**Include**

```
<script src="jquery.waypoint.min.js"></script>
```

**jQuery**

```
$('.someElement').waypoint({
  onEnter: function () {
    console.log('enter!');
  },
  
  onExit: function () {
    console.log('exit!');
  },
  
  onActive: function () {
    console.log('active!');
  },
  
  onDeactive: function () {
    console.log('deactive!');
  }
});
```

**or with extra parameters**

```
$('.someElement').waypoint({
  once: true,
  offset: 50,

  onEnter: function () {
    console.log('enter!');
  }
});
```
