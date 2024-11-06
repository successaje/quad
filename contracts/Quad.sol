// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.27;

interface IERC20 {
    function transferFrom(address sender, address recipient, uint256 amount) external returns (bool);
    function transfer(address recipient, uint256 amount) external returns (bool);
}

contract Quad {

    address public owner;
    IERC20 public token;

    struct User {
        address userAddress;
        string username;
        string email;
        string phoneNumber;
        string bio;
        uint256 balance;
        bool registered;
    }

    // mapping(address => User) private users;
    mapping(address => User) public users;
    
    event UserRegistered(address user, string username);
    event UserProfileUpdated(address userAddress, string username, string email, string phoneNumber, string bio);
    event FundsDeposited(address user, uint256 amount);
    event FundsTransferred(address from, address to, uint256 amount);

    modifier onlyOwner() {
        require(msg.sender == owner, "Not authorized");
        _;
    }

      modifier userRegistered() {
        require(users[msg.sender].registered, "User not registered");
        _;
    }


    constructor(address tokenAddress) {
        owner = msg.sender;
        token = IERC20(tokenAddress);
    }

    /// @notice Register a new user with basic profile details
    /// @param _username The user's chosen username
    /// @param _email The user's email address
    /// @param _phoneNumber The user's phone number
    /// @param _bio A short bio for the user's profile
    function registerUser(string memory _username, string memory _email, string memory _phoneNumber, uint256 _balance, string memory _bio) external {
        require(!users[msg.sender].registered, "User already registered");
        
        users[msg.sender] = User({
            userAddress: msg.sender,
            username: _username,
            email: _email,
            phoneNumber: _phoneNumber,
            bio: _bio,
            balance: _balance,
            registered: true
        });

        emit UserRegistered(msg.sender, _username);
    }

    /// @notice Update the user's profile details
    /// @param _username The new username
    /// @param _email The new email address
    /// @param _phoneNumber The new phone number
    /// @param _bio The new bio
    function updateUserProfile(string memory _username, string memory _email, string memory _phoneNumber, string memory _bio) external userRegistered {
        User storage user = users[msg.sender];
        
        user.username = _username;
        user.email = _email;
        user.phoneNumber = _phoneNumber;
        user.bio = _bio;

        emit UserProfileUpdated(msg.sender, _username, _email, _phoneNumber, _bio);
    }

     /// @notice Get the user profile details of the caller
    /// @return username, email, phone number, and bio of the user
    function getUserProfile() external view userRegistered returns (string memory, string memory, string memory, string memory) {
        User storage user = users[msg.sender];
        return (user.username, user.email, user.phoneNumber, user.bio);
    }

    /// @notice Get a user profile by address (only accessible by contract owner for privacy)
    /// @param userAddress The address of the user to query
    /// @return The user profile details (username, email, phone number, and bio)
    function getUserProfileByAddress(address userAddress) external view onlyOwner returns (string memory, string memory, string memory, string memory) {
        require(users[userAddress].registered, "User not registered");
        User storage user = users[userAddress];
        return (user.username, user.email, user.phoneNumber, user.bio);
    }


    function depositFunds(uint256 amount) external {
        require(users[msg.sender].registered, "User not registered");
        // ! User balance must be greater than 0
        // ! What about multi tokens
        require(token.transferFrom(msg.sender, address(this), amount), "Transfer failed");
        users[msg.sender].balance += amount;
        emit FundsDeposited(msg.sender, amount);
    }

    function transferFunds(address recipient, uint256 amount) external {
        require(users[msg.sender].balance >= amount, "Insufficient funds");
        require(users[recipient].registered, "Recipient not registered");

        users[msg.sender].balance -= amount;
        users[recipient].balance += amount;

        emit FundsTransferred(msg.sender, recipient, amount);
    }
}
