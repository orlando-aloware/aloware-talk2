<template>
  <div class="contact-list-sidebar-wrapper">
    <b-card no-body class="no-border">
      <b-list-group>
        <b-list-group-item href="#" class="d-flex align-items-center border-0 pb-0" v-for="contact in contacts" :key="contact.id">
          <b-avatar class="mr-2 contact-avatar"
                    size="2.5rem"
                    :text="contact.letter">
          </b-avatar>
          <div class="d-inline-flex justify-content-between full-width contact-details">
            <div class="mr-auto">
              <p class="text-bold contact-name mb-0">{{ contact.name }}</p>
              <p class="text-sm-left contact-phone">
                {{ contact.phone }}
              </p>
            </div>
            <p>
              <b-badge pill
                        class="contact-badge"
                        variant="danger">
                5
              </b-badge>
            </p>
          </div>
        </b-list-group-item>
      </b-list-group>
    </b-card>
  </div>
</template>

<script>
export default {
  name: 'sidebar',
  data () {
    return {
      contacts: [
        {
          id: 1,
          name: 'Susan Daniel',
          phone: '(514) 423 3566',
          letter: 'SD'
        }, {
          id: 2,
          name: 'Walter Bowman',
          phone: '(514) 423 3566',
          letter: 'MA'
        }, {
          id: 3,
          name: 'Elisabetta Wicklen Smith Goldhammer',
          phone: '(514) 423 3566',
          letter: 'EW'
        }, {
          id: 4,
          name: 'Seka Fawdrey',
          phone: '(514) 423 3566',
          letter: 'SF'
        },
        {
          id: 5,
          name: 'Brunhilde Panswick',
          phone: '(514) 423 3566',
          avatar: 'BP'
        }, {
          id: 6,
          name: 'Winfield Stapforth',
          phone: '(514) 423 3566',
          avatar: 'WS'
        },
        {
          id: 7,
          name: 'Brunhilde Panswick',
          phone: '(514) 423 3566',
          avatar: 'BP'
        }, {
          id: 8,
          name: 'Winfield Stapforth',
          phone: '(514) 423 3566',
          avatar: 'WS'
        },
        {
          id: 9,
          name: 'Brunhilde Panswick',
          phone: '(514) 423 3566',
          avatar: 'BP'
        }, {
          id: 10,
          name: 'Winfield Stapforth',
          phone: '(514) 423 3566',
          avatar: 'WS'
        },
        {
          id: 11,
          name: 'Brunhilde Panswick',
          phone: '(514) 423 3566',
          avatar: 'BP'
        }, {
          id: 12,
          name: 'Winfield Stapforth',
          phone: '(514) 423 3566',
          avatar: 'WS'
        }
      ]
    }
  }
}
</script>

<style lang="scss" scoped>
  .contact-list-sidebar-wrapper {
    height: 100%;
    border-right: 1px solid #dee2e6;
    display: flex;
    justify-content: flex-end;

    .card {
      height: calc(100vh - 80px);
      overflow: auto;
    }

    .contact-details {
      border-bottom: 1px solid #dee2e6;

      .contact-name{
        font-size: 0.85em;
        display: inline-block;
        width: 190px;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
      .contact-phone {
        font-size: 0.70em;
      }

      .contact-badge{
        margin-top: 15px;
      }
    }

    .contact-avatar {
      margin-top: -8px !important;
    }

  }
</style>
