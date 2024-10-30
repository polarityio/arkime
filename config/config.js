module.exports = {
  name: 'Arkime',
  acronym: 'ARK',
  description: 'Search Arkime',
  entityTypes: ['IPv4', 'IPv6', 'domain', 'url'],
  styles: ['./styles/styles.less'],
  onDemandOnly: true,
  defaultColor: 'light-gray',
  block: {
    component: {
      file: './components/block.js'
    },
    template: {
      file: './templates/block.hbs'
    }
  },
  request: {
    cert: '',
    key: '',
    passphrase: '',
    ca: '',
    proxy: ''
  },
  logging: {
    level: 'info'
  },
  options: [
    {
      key: 'url',
      name: 'Arkime Server URL',
      description:
        'URL for your Arkime Server to include schema (https://) and port if necessary',
      default: '',
      type: 'text',
      userCanEdit: false,
      adminOnly: true
    },
    {
      key: 'username',
      name: 'Arkime Username',
      description:
        'Username of the Arkime user account to authenticate with. The account should have "Header Auth Enabled" and does not need "Web Enabled" access.',
      default: '',
      type: 'text',
      userCanEdit: false,
      adminOnly: true
    },
    {
      key: 'password',
      name: 'Arkime Password',
      description: 'Password for the provided Arkime Username',
      default: '',
      type: 'password',
      userCanEdit: false,
      adminOnly: true
    },
    {
      key: 'ipExpression',
      name: 'Arkime IP Expression',
      description:
        'The Arkime expression to run when running searches on IP addresses.  The string `{{ENTITY}}` will be replace by the looked up IP address. If left blank, no IP searches will be run.',
      default: 'ip == {{entity}}',
      type: 'text',
      userCanEdit: false,
      adminOnly: true
    },
    {
      key: 'domainExpression',
      name: 'Arkime Domain Expression',
      description:
        'The Arkime expression to run when running searches on Domains.  The string `{{ENTITY}}` will be replace by the looked up domain. If left blank, no domain searches will be run.',
      default: 'host == {{entity}}',
      type: 'text',
      userCanEdit: false,
      adminOnly: true
    },
    {
      key: 'urlExpression',
      name: 'Arkime URL Expression',
      description:
        'The Arkime expression to run when running searches on URLs.  The string `{{ENTITY}}` will be replace by the looked up URL. If left blank, no URL searches will be run.',
      default: 'http.uri == {{entity}}',
      type: 'text',
      userCanEdit: false,
      adminOnly: true
    },
    {
      key: 'hoursBack',
      name: 'Hours Back to Search',
      description:
        'The number of hours back to search.  Defaults to 1 (i.e., search the last hour of data).  If set to -1, all data will be searched.  The user used to authenticate to Arkime must have "Query Time Limit" greater or equal to this setting.',
      default: 1,
      type: 'number',
      userCanEdit: false,
      adminOnly: true
    },
    {
      key: 'summary',
      name: 'Session Summary Fields',
      description:
        'Comma delimited list of session database fields to display in the summary section of the details block.  Fields not listed will be viewable when the user clicks to view additional details.  The default fields are `firstPacket, lastPacket, ipProtocol, source.ip, source.port, destination.ip, destination.port, network.packets, network.bytes, node`.  If left blank, the default fields will be used.',
      default:
        'firstPacket, lastPacket, ipProtocol, source.ip, source.port, destination.ip, destination.port, network.packets, network.bytes, node',
      type: 'text',
      userCanEdit: false,
      adminOnly: true
    }
  ]
};
