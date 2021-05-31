# Repository Settings and Branch Protections Probot

This Probot function will configure the following repository settings:

- Enable issues
- Disable projects
- Disable wikis
- Disable Squash & Merge
- Enable Merge commits
- Disable Rebase merge

It will also configure the following branch protection rules on `main`:

- Require the following status checks:
  - Lint Code Base
- Require branches to be up to date before merging
- Enforce branch protection rules on administrators
- Require pull request reviews
- Dismiss stale reviews
- Restrict who can dismiss pull request reviews to organization and repository admins
- Restrict who can push to matching branches to organization and repository admins

When a new repository is created and the settings and protection rules have been put in place, it will create an issue in the Probot host repository.

Probot applications must be hosted outside of GitHub.  You will need the following pre-requisites:

- NPM on your local machine for building and testing the app
- Cloud service to host the application
- This app can only run in organizations that are associated with Team and Enterprise billing plans

To enable this Probot on your own organization:

1. Fork this repository into the target organization
1. Clone the repository to your local machine
1. Navigate to the organization settings
1. Select "Developer Settings" and then "GitHub Apps"
1. Create a new GitHub app with the following:
    - Name of the app
    - Homepage URL - this is the repository where the app code lives
    - Webhook URL - you can utilize [smee.io](https://smee.io) for this or any other webhook payload delivery service
    - Webhook secret - this is recommended and can be created by following [these instructions](FAQ.md)
    - Under "Repository permissions" select the following:
        - Administration - "Read & write"
        - Issues - "Read & write"
        - Contents - "Read-only"
        - Metadata - "Read-only"
        - Subscribe to events:
            - Create
            - Repository
            - Issues
    - Select "Create GitHub App"
1. Generate a private key for the application
1. Save the PEM to the repository root location on local machine
1. On your local machine, navigate to the repository
1. Copy the contents of `.env.example` into a new file named `.env`
1. Fill in the following on the `.env` file:
    - APP_ID
    - WEBHOOK_SECRET
    - WEBHOOK_PROXY_URL
1. Install the app on your organization:
    1. In your GitHub organization settings, navigate to "Developer Settings"
    1. Select "GitHub Apps"
    1. Select the app you just created in the organization
    1. Go to "Install App"
    1. Select "Install" next to the organization you wish to install the app on
    1. Select if you want it on "All repositories" or "Only select repositories" then click "Install"
1. Run `npm install` on in your CLI from the root of the repository to build the app locally
1. Run `npm start` to start the app locally for testing
1. Deploy the Probot app on the cloud service of your choice following [this guide](https://probot.github.io/docs/deployment/#deploy-the-app)

## Run as Docker Container

Once the PEM and environment variables have been filled out for your probot app, you can dockerize the build and run it locally.

1. Run the following command to create the docker container:
    `docker build . -t <container-name>`
1. Run the following command to run the container:
    `docker run -p 49160:8080 -d <container-name>`

## Resources:

- [GitHub Services Toolbox- repo-settings](https://github.com/github/services-toolbox/tree/main/bots/probot/repo-settings)
- [Probot help documents](https://probot.github.io/docs/)
