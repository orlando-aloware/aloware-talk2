<template>
  <div class="task-list w-100">
    <task-item v-for="communication in communications"
               :key="communication.id"
               :communication="communication">
    </task-item>
  </div>
</template>

<script>
import TaskItem from 'components/icons/inbox/task-item'
export default {
  name: 'task-list',
  components: { TaskItem },
  data () {
    return {
      communications: [
        {
          id: 1,
          type: 1,
          direction: 1,
          campaign_id: 373,
          current_status2: 3,
          disposition_status2: 1,
          body: null,
          contact: {
            name: 'John Smith'
          },
          created_at: '2021-07-21 11:06:01'
        },
        {
          id: 2,
          type: 1,
          direction: 1,
          campaign_id: 11,
          current_status2: 3,
          disposition_status2: 1,
          body: null,
          contact: {
            name: 'Mark Avery'
          },
          created_at: '2021-07-21 11:06:01'
        },
        {
          id: 3,
          type: 1,
          direction: 1,
          campaign_id: 443,
          current_status2: 9,
          disposition_status2: 3,
          body: null,
          contact: {
            name: 'Ashley Meyers'
          },
          created_at: '2021-07-21 11:06:01'
        },
        {
          id: 4,
          type: 2,
          direction: 1,
          campaign_id: 11,
          current_status2: 9,
          disposition_status2: 4,
          body: 'Hi, where can I find an article in the knowledge base about Sequences+?',
          contact: {
            name: 'Cam Johnson'
          },
          created_at: '2021-07-21 11:06:01'
        },
        {
          id: 5,
          type: 2,
          direction: 1,
          campaign_id: 11,
          current_status2: 9,
          disposition_status2: 4,
          body: 'Hi, do you know where the settings for the ring group is?',
          contact: {
            name: 'Walter Bowman'
          },
          created_at: '2021-07-21 11:06:01'
        },
        {
          id: 6,
          type: 2,
          direction: 1,
          campaign_id: 506,
          current_status2: 9,
          disposition_status2: 4,
          body: 'Hi, where can I find a tutorial for sending bulk messages?',
          contact: {
            name: 'Sarah Johnson'
          },
          created_at: '2021-07-20 08:21:33'
        },
        {
          id: 7,
          type: 2,
          direction: 1,
          campaign_id: 373,
          current_status2: 9,
          disposition_status2: 4,
          body: 'Hi, do you know where to create a new Line?',
          contact: {
            name: 'Tyler Smith'
          },
          created_at: '2021-07-20 07:21:33'
        }
      ]
    }
  }
}
</script>
