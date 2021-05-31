const { strict } = require('assert')
const path = require('path')

module.exports = app => {
  app.log(`Repo settings🤖  is alive at: ${path.dirname(__filename)}`)

  app.on('repository.created', async context => {
    const { github } = context
    const { owner, repo } = context.repo()

    Promise.all([
      // Apply default repo settings
      await github.repos.update(
        context.repo({
          owner,
          repo,
          name: repo,
          has_issues: true,
          has_projects: false,
          has_wiki: false,
          allow_squash_merge: false,
          allow_merge_commit: true,
          allow_rebase_merge: false
        })
      )
    ])
      .then(values => {
        context.log.debug(values)
        context.log(`Default repo settings applied for: ${owner}/${repo}`)
      })
      .catch(error => {
        context.log.error(error)
      })
  })

  app.on('create', async context => {
    const branch = context.payload.ref
    const { owner, repo } = context.repo()

    // Add branch protection for 'main'
    if (branch === 'main' && context.payload.ref_type === 'branch') {
      const { github } = context

      Promise.all([
        await github.repos.updateBranchProtection({
          owner,
          repo,
          branch,
          required_status_checks: {
            strict: true,
            contexts: [
              'Lint Code Base'
            ]
          },
          enforce_admins: true,
          required_pull_request_reviews: {
            dismissal_restrictions: {
              users: [                
              ],
              teams: [                
              ]
            },
            dismiss_stale_reviews: true,
            require_code_owner_reviews: false,
          },
          restrictions: {
            users: [              
            ],
            teams: [              
            ],
            apps: [              
            ]
          }
        }),
        await github.repos.addProtectedBranchRequiredSignatures({
          owner,
          repo,
          branch
        }),
      ])
        .then(values => {
          context.log.debug(values)
          context.log(`Branch protection enabled for: ${owner}/${repo}:${branch}`)
        })
        .catch(error => {
          context.log.error(error)
        })
        await context.github.issues.create({
          owner: `selkins13-Training-Ground`,
          repo: `ideal-octo-meme`,
          title: `${owner}/${repo} branch protection rules on ${branch}`,
          body: `Hey @selkins13, make sure the branch following rules are in place: 
          - Require the following status checks: Lint Code Base
          - Require branches to be up to date before merging
          - Enforce branch protection rules on administrators
          - Require pull request reviews
          - Dismiss stale reviews
          - Restrict who can dismiss pull request reviews to organization and repository admins
          - Restrict who can push to matching branches to organization and repository admins`
        })
    }
  })
}