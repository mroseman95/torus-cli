# Quickstart

We're composing applications as much as building them these days; combining services we manage with those managed for us, cloud services like [Stripe](https://stripe.com/docs) or [Sendgrid](https://sendgrid.com). The more services we have, the more sensitive data we have to manage.

Today, we either default to manually shuffling secrets around (which is time-consuming and risky) or stand up and operate additional infrastructure.

**Torus makes it easy to store, manage and share secrets.**

In this quickstart you’ll learn how to:

- Initialize a project
- Store, view and use secrets in development
- Share secrets
- Take secrets beyond development

_Remember to [install Torus](https://torus.sh/install) and [sign-up](https://torus.sh/) for a free account before getting started._

### Quick, before you start

Torus will work regardless of your preferred stack, but in this introduction, we’re going to assemble an API with Node and the Express framework in a fictional project called knotty-buoy.

Clone the [manifoldco/quickstart](https://github.com/manifoldco/quickstart) repo to follow-along.

```sh
$ git clone https://github.com/manifoldco/quickstart manifold-quickstart
$ cd manifold-quickstart
```

## Initialize a Torus project

We can use the `link` command to add a new project to our personal organization and generate a  `.torus.json` file. This file will contain the name of the organization and project we want to associate with our API, which Torus will then use by default. Include the `--org` and `--project` flags to override this default.

The `link` command will prompt you to select or create an organization and project.

> ❤ &nbsp;You start with a personal organization.

```sh
$ torus link
? Select organization:
+  Create a new organization
 ☞ skywalker [personal]
```

```sh
✔ Select organization: skywalker
?  Select project: knotty-buoy
Project knotty-buoy created.

This directory and its subdirectories have been linked to:
Org:     skywalker
Project: knotty-buoy

Use 'torus status' to view your full working context.
```

> 🔮 &nbsp;Commit the `.torus.json` file generated by the `link` command.

A typical application includes at least one service. In a simple app, a service will be synonymous with a process, which you will run with a single command.

`torus link` will create a `default` service for you.

```sh
$ torus services list
  knotty-buoy (1)
  --------------
  default
```

We've used the `link` command to create the `knotty-buoy` project in our personal organization and
a default service was generated for us. Now, we're ready to store our first secret!

## Store, view and use secrets

First we'll encrypt and store a secret, then we'll use that secret in development.

In this example we're going to keep it simple, but you can store any application secret in Torus,
those might include resource handles to services you manage, credentials for managed services or
per-deploy values like hostname and port.

### Store a secret

Use `torus set` to encrypt and store two mission-critical secrets.

```sh
$ torus set HELLO 👋
Credentials retrieved
Keypairs retrieved
Encrypting key retrieved
Credential encrypted
Completed Operation

Credential hello has been set at /skywalker/knotty-buoy/dev-skywalker/default/*/1/hello
```

```
$ torus set WORLD 🌎
...
Credential world has been set at /skywalker/knotty-buoy/dev-skywalker/default/*/1/world
```

Decrypt and view your new secrets.

```sh
$ torus view
HELLO=👋
WORLD=🌎
```

> 😂  &nbsp;Emojis do not make your secrets more secure, but they do make them more entertaining.

### Use secrets in development

To decrypt and inject our secrets into our application at runtime, we’ll use the `run` command.

```sh
$ torus run node index.js
 torus-quickstart sample running on port 3001
```

```sh
$ curl localhost:3000
 👋 🌎
```

Our Express API is just ten lines of code and demonstrates how our secrets are being consumed.

```js
var express = require('express');
var app = express();

app.get('/', function (req, res) {
  res.send(`${process.env.HELLO} ${process.env.WORLD}`);
});

app.listen(process.env.PORT || 3000, function () {
  console.log('Example app listening on port 3000!');
});
```

It’s lonely working alone, let’s invite someone to join our organization.

## Share secrets

When you create an organization, three default system teams are provisioned for you: owner, admin,
and member. The (*) denotes teams to which we belong.

```sh
$ torus teams list
* owner  [system]
* admin  [system]
* member [system]

(*) member
```

When a user joins your organization, they become a member and are added to the `member` team, which
grants them limited access to secrets in development.

### Invite someone to join your organization

```sh
$ torus invites send ren@manifold.co
Invitation to join the skywalker organization has been sent to ren@manifold.co.

They will be added to the following teams once their invite has been confirmed:

  member

They will receive an e-mail with instructions.
```

We can check to see whether they've accepted our invitation.

```sh
$ torus invites list

Listing all pending and accepted invitations for the skywalker org

EMAIL              USERNAME    STATE           INVITED BY

ren@manifold.co    ren         accepted        creager
```

Before their keyring membership can be created, we must approve their invitation—we are giving them
a 🔑 to our secrets after all.

```sh
$ torus invites approve ren@manifold.co
Invite retrieved
Keypairs retrieved
Claims retrieved
Keyrings retrieved
Keyring memberships created
Invite approved
Completed

You have approved the invitation for: ren@manifold.co.

They are now a member of your organization!
```

### Create a shared secret

You’re the only one able to read secrets in your personal dev environment, and so the two secrets
we've created thus far are not available to our new user.

The `set` command accepts a `-e` flag we can use to override the default
environment (`dev-${username}`).

Specify the shared `dev-*` environment instead, this is an environment that every
members of your organization has access to.

```sh
$ torus set PORT 3001 -e dev-*
...
Credential port has been set at /skywalker/knotty-buoy/dev-*/default/*/1/port
```

`PORT` is now a shared secret with a value of `3001` and is available to any member of our
organization.

```sh
$ torus view
HELLO=👋
WORLD=🌎
PORT=3001
```

This is a great way to provide a set of default development secrets for an application, as the `run` command
sources secrets from `dev-*`. To override these defaults, we would set the port *without*
specifying the `dev-*` environment.

## Take secrets beyond development

We’re going to create a staging environment and a user with read-only access and then use `torus`
to run our Express API on bare-metal. Onward and upward.

### Create a staging environment

By default, any secret we set will belong to the `dev-{username}` env, a personal development environment. This environment is created when you create or join an organization.

List the environments in our organization by project.

```sh
$ torus envs list
knotty-buoy (1)
---- ----------
dev-skywalker
```

Create a new staging environment using the `envs create` command.

```sh
$ torus envs create staging
✔ Org name:         skywalker
✔ Project name:     knotty-buoy
✔ Environment name: staging

Environment staging created.
```

---

### Create a machine with read-only access

We will create a unique machine for our application server called “api-hw1xd09x”.

During the create process we will be asked to select or create a team, we create a team called “api” to represent all of our API machines.

```sh
$ torus machines create api
✔ Org name: skywalker
✔ Select Machine Team: api
✔ Enter machine name: api-hw1xd09x


Creating machine "api-hw1xd09x"
Generating machine token
Generating token keypairs
Uploading token keypairs
Creating keyring memberships for token
Uploading keyring memberships
Machine created


You will only be shown the secret once, please keep it safe.


Machine ID:          		04btf1c[redacted]6hnbpt0
Machine Token ID:     	04cf2pr5h[redacted]uy1yj
Machine Token Secret: 	tdSc[redacted]J4St
```

We make note of the Token ID and Token Secret as we’ll be using those later when our machine authenticates with Torus.

Next, we want to restrict the access that our API machines have. Using `torus allow` we’re able to specify access restrictions for our API machines.

```sh
$ torus allow rl /skywalker/knotty-buoy/staging/default/*/*/* api
Policy generated and attached to the api team.


Effect:    allow
Action(s): read, list
Resource:  /skywalker/knotty-buoy/staging/default/*/*/*


Necessary permissions (read, list) have also been granted
```

The `rl` represents two of the possible `crudl` actions, meaning we’ve only given Read and List permission to our team for the path provided.

> 😬 &nbsp;Stay tuned for more documentation on the resource path you see above.

---

### Use `torus` to run our Express API in staging

When you execute the `run` command in staging, we need to authenticated. For
simplicity sake, we will use environment variables to pass our credentials to
`run`. A machine identity requires the `TORUS_TOKEN_ID` and `TORUS_TOKEN_SECRET`
environment variables (grab those from the previous step).

> Note: We **strongly** recommend proper segregation of your TOKEN_ID and TOKEN_SECRET on your non-development machines.

Our application is on Digital Ocean, so let's SSH in and export the read-only credentials.

```sh
$ ssh root@45.55.166.61
$ export TORUS_TOKEN_ID=04cf2pr5h[redacted]uy1yj
$ export TORUS_TOKEN_SECRET=tdSc[redacted]J4St
```

It’s generally advisable to start our Node application with `npm start`, which is specified
in our project’s `package.json`.

Prefix the standard `node index.js` with `torus run` and include flags to specify the `staging`
environment and `default` service.

```sh
{
  "name": "torus-quickstart-example",
  ...
  "scripts": {
    "start": "torus run -e staging -s default node index.js"
  }
}
```

With our credentials exported and our `package.json` updated, we’re ready to daemonize our app with
[PM2](https://github.com/Unitech/pm2)!

```sh
pm2 start npm -- start
```

With that, we're up and running on staging!

_This is an early version of Torus and the Getting Started guide and we'd love your feedback. You can
get in touch by hitting the chat bubble on the bottom-right, or sending us an [email](mailto:creager@torus.sh)._