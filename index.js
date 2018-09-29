const { google } = require('googleapis');
const { getValues, addRow } = require('./util');
const { ApolloServer, gql } = require('apollo-server');

const typeDefs = gql`

  enum Availability {
    LOW
    MED
    HIGH
  }
  
  enum CommunicationPreference {
    VIDEO_CHAT
    CHAT
    EMAIL
  }

  enum LearningStyle {
    TUTORIALS
    DOCUMENTATION
    PAIR PROGRAMMING
    BOOKS
  }

  enum SkillLevel {
    BEGINNER
    INTERMEDIATE
    ADVANCED
  }

  type ProgrammingLanguage {
    language: String!
    skill_level: SkillLevel
  }

  input ProgrammingLanguageInput {
    language: String!
    skill_level: SkillLevel
  }

  type Response {
    name: String
    github_username: String
    discord_username: String
    availability: Availability
    time_zone: String
    interests: [String]
    programming_languages: [ProgrammingLanguage]
    current_skillset: [String]
    desired_skillset: String
    learning_style: [LearningStyle]
    communication_preference: [CommunicationPreference]
  }

  input ResponseInput {
    name: String
    github_username: String
    discord_username: String
    availability: Availability
    time_zone: String
    interests: [String]
    programming_languages: [ProgrammingLanguageInput]
    current_skillset: [String]
    desired_skillset: String
    learning_style: [LearningStyle]
    communication_preference: [CommunicationPreference]
  }

  type Query {
    responses: [Response]
  }

  type Mutation {
    createResponse(response: ResponseInput!): Boolean
    updateResponse(response: ResponseInput!, where: Int!): Boolean
    # TODO: updateResponse mutation
  }

`;

const resolvers = {
  Query: {
    responses: async (_, args, ctx) => {
      const response = await getValues(ctx);
      return response; 
    },
  },

  Mutation: {
    createResponse: async (_, { response }, ctx) => {
      const res = await addRow(ctx, response);
      return res;
    }
  }
};

const server = new ApolloServer({ 
  typeDefs, 
  resolvers,
  context: async () => {
    const auth = await google.auth.getClient({
      // Scopes can be specified either as an array or as a single, space-delimited string.
      scopes: ['https://www.googleapis.com/auth/spreadsheets']
    }); 
    return {
      auth
    }
  }
});

server.listen().then(({ url }) => {
  console.log(`🚀  Server ready at ${url}`);
});
