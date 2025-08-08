# Final Cloud Build Triggers Setup

A new GitHub connection has been created for the Paul-Bonneville-Labs organization.

## Complete OAuth for Paul-Bonneville-Labs Connection

1. **Visit Cloud Build Triggers Console**:
   ```
   https://console.cloud.google.com/cloud-build/triggers?project=paulbonneville-com
   ```

2. **Complete OAuth for paul-bonneville-labs-connection**:
   - Look for the new connection: `paul-bonneville-labs-connection`
   - Complete the GitHub OAuth process
   - **Important**: When authorizing, make sure to select the **Paul-Bonneville-Labs** organization
   - Grant access to the `neemee` repository

3. **Connect Repository**:
   - After OAuth is complete, click "Connect Repository"
   - Select: `Paul-Bonneville-Labs/neemee`
   - Click "Connect"

4. **Create Triggers via Console**:
   After connecting the repository, create these 3 triggers:

### Trigger 1: CI Validation
```
Name: neemee-frontend-ci
Event: Pull request
Repository: Paul-Bonneville-Labs/neemee  
Branch: .* (any branch)
Build configuration: Cloud Build configuration file
Configuration file location: frontend/cloudbuild-ci.yaml
Service Account: 860937201650@cloudbuild.gserviceaccount.com
```

### Trigger 2: Staging Deployment
```
Name: neemee-frontend-staging  
Event: Push to branch
Repository: Paul-Bonneville-Labs/neemee
Branch: ^develop$
Build configuration: Cloud Build configuration file
Configuration file location: frontend/cloudbuild-staging.yaml
Service Account: 860937201650@cloudbuild.gserviceaccount.com
```

### Trigger 3: Production Deployment
```
Name: neemee-frontend-production
Event: Push to branch  
Repository: Paul-Bonneville-Labs/neemee
Branch: ^main$
Build configuration: Cloud Build configuration file
Configuration file location: frontend/cloudbuild-production.yaml
Service Account: 860937201650@cloudbuild.gserviceaccount.com
```

## Alternative: Direct Repository Connection

If the console method doesn't work, try this direct link:
```
https://console.cloud.google.com/cloud-build/triggers;region=us-central1/connect?project=860937201650
```

## Verification

After creating the triggers, verify with:
```bash
gcloud builds triggers list
```

You should see all 3 triggers listed and active.