- Multiple systems
- Process flow

  - User uploads file
    - Any file type, simple form
  - File backed up to random k servers in cluster
    - Get all servers
    - Pick random
    - Check capacity
    - if space, store
    - Pick another
    - if space store
  - User requests for file

    - Maintain a mapping for file locations on every server
    - With new file, this mapping is updated

  - File found in cluster and returned
  - Login/Registration form
    - Simple auth app
