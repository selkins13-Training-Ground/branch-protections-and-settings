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
        })
      ])
        .then(values => {
          context.log.debug(values)
          context.log(`Branch protection enabled for: ${owner}/${repo}:${branch}`)
        })
        .catch(error => {
          context.log.error(error)
        })
    }
  })
}