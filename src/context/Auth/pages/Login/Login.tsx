import { useState } from "react";
import { InputGroup } from "react-bootstrap";
import Button from "react-bootstrap/Button";
import Feedback from "react-bootstrap/esm/Feedback";
import Form from "react-bootstrap/Form";
import { useAuth } from "../../provider";
import "./login.scss";

export default function Login() {
  const { loading, createSession, authError } = useAuth();
  const [username, setUsername] = useState<string>("");
  const [isValidating, setIsValidating] = useState(false);

  return (
    <div className="login" style={{ textAlign: 'left'}}>
      <Form
        noValidate
        onSubmit={(e) => {
          e.preventDefault();
        }}
      >
        <Form.Group className="mb-3" controlId="formBasicUsername">
          <Form.Label>Username</Form.Label>
          <Form.Control
            isInvalid={isValidating && authError !== undefined}
            isValid={isValidating && authError === undefined}
            value={username}
            onChange={(e) => {
              setUsername(e.target.value);
            }}
            type="text"
            placeholder="Enter your username"
          />
          <Form.Control.Feedback type="invalid">
            {authError}
          </Form.Control.Feedback>
          <Form.Control.Feedback type="valid">
            Username looks good.
          </Form.Control.Feedback>
          <Form.Text className="text-muted">
            This is the username you'll have in the game
          </Form.Text>
        </Form.Group>
        <Form.Group className="mb-3" controlId="formBasicCheckbox">
          <Form.Check type="checkbox" label="I accept the game rules" />
        </Form.Group>
        <Button
          variant="primary"
          type="submit"
          onClick={() => {
            setIsValidating(true);
            createSession(username);
          }}
        >
          Join the server
        </Button>
      </Form>
    </div>
  );
}
